import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import OpenAI from "openai";
import path from "path";
import { pathToFileURL } from "url";

// Polyfill DOMMatrix for pdf-parse (pdf.js dependency) in Node environment
if (typeof global.DOMMatrix === "undefined") {
  global.DOMMatrix = class DOMMatrix {} as any;
}
const pdfParse = require("pdf-parse");

// Set worker path using a valid file:// URL for ESM compatibility on Windows
const workerUrl = pathToFileURL(
  path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
).toString();
pdfParse.PDFParse.setWorker(workerUrl);

const MINIMUM_TEXT_LENGTH = 100;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const client = createServerClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
      cookies: cookieStore,
    });

    const { data: userData, error: userError } =
      await client.auth.getCurrentUser();
    if (userError || !userData?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = userData.user.id;
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    let buffer: Buffer;

    if (file && file.size > 0) {
      if (file.type !== "application/pdf") {
        return NextResponse.json(
          { success: false, error: "Only PDF files are supported." },
          { status: 400 },
        );
      }
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // Fallback: fetch stored resume using the key saved in the user's profile
      const { data: profileData, error: profileError } = await client.database
        .from("profiles")
        .select("resume_pdf_key")
        .eq("id", userId)
        .maybeSingle();

      const storedKey = profileData?.resume_pdf_key ?? null;

      if (profileError || !storedKey) {
        return NextResponse.json(
          {
            success: false,
            error: "No resume found. Please upload a PDF resume first.",
          },
          { status: 404 },
        );
      }

      const { data: downloadData, error: downloadError } = await client.storage
        .from("resumes")
        .download(storedKey);

      if (downloadError || !downloadData) {
        return NextResponse.json(
          {
            success: false,
            error: "Could not load your stored resume. Please re-upload it.",
          },
          { status: 404 },
        );
      }

      // Convert downloaded Blob to ArrayBuffer then Buffer
      const arrayBuffer = await downloadData.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    // Extract raw text from the PDF buffer
    let extractedText: string;

    try {
      const { PDFParse } = pdfParse;
      const parser = new PDFParse({ data: buffer });
      const pdfData = await parser.getText();
      extractedText = pdfData.text;
      await parser.destroy();
    } catch (err) {
      console.error("[resume/extract] PDF parsing error detail:", err);
      return NextResponse.json(
        {
          success: false,
          error:
            `Could not read this PDF: ${err instanceof Error ? err.message : String(err)}`,
        },
        { status: 422 },
      );
    }

    if (!extractedText || extractedText.trim().length < MINIMUM_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not extract text from this PDF. It may be image-based. Please try a different file.",
        },
        { status: 422 },
      );
    }

    // Send extracted text to AI for structured extraction via OpenRouter
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY!,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "JobPilot",
      },
    });

    const prompt = `You are a resume parser. Extract structured profile data from the following resume text.

Return ONLY valid JSON — no markdown, no code fences, no explanation. Use exactly this shape:

{
  "full_name": string | null,
  "phone": string | null,
  "location": string | null,
  "linkedin_url": string | null,
  "portfolio_url": string | null,
  "current_title": string | null,
  "experience_level": "junior" | "mid" | "senior" | "lead" | null,
  "years_experience": number | null,
  "skills": string[],
  "industries": string[],
  "work_experience": [
    {
      "company": string,
      "jobTitle": string,
      "startMonth": string,
      "startYear": string,
      "endMonth": string,
      "endYear": string,
      "isCurrent": boolean,
      "responsibilities": string
    }
  ],
  "education": {
    "highestDegree": "none" | "high_school" | "associate" | "bachelor" | "master" | "phd" | "bootcamp" | "other",
    "fieldOfStudy": string,
    "institutionName": string,
    "graduationYear": string
  },
  "job_titles_seeking": string[],
  "work_authorization": "citizen" | "permanent_resident" | "visa_required" | null
}

Rules:
- For experience_level: infer from years of experience and titles. 0-2 years = junior, 2-5 = mid, 5-10 = senior, 10+ = lead.
- For work_experience: include all roles found (up to 3 most recent). startMonth and endMonth should be full month names (e.g. "January"). Leave endMonth/endYear empty and set isCurrent to true for current roles.
- For skills: extract specific technical skills, tools, languages, and frameworks only. No soft skills.
- For industries: infer the industries the person has worked in from company context and role descriptions.
- For job_titles_seeking: leave as empty array — we cannot infer this from a resume.
- If a field cannot be determined from the resume, use null for strings/numbers and [] for arrays.

RESUME TEXT:
${extractedText.substring(0, 8000)}`;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-3.1-flash-lite",
      messages: [{ role: "user", content: prompt }],
    });
    const responseText = (completion.choices[0]?.message?.content ?? "").trim();

    let extracted: Record<string, unknown>;
    try {
      // Strip markdown code fences if model wraps the response
      const cleaned = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      extracted = JSON.parse(cleaned);
    } catch {
      console.error("[resume/extract] Failed to parse Gemini response:", responseText);
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to parse the extraction result. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: extracted });
  } catch (error) {
    console.error("[resume/extract]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
