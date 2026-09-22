/**
 * Browserless client for fetching and extracting rendered page content
 */

export interface ExtractedPage {
  url: string;
  text: string;
  sublinks: string[];
}

/**
 * Fetches rendered HTML for a given URL using the Browserless REST API.
 */
export async function fetchRenderedPage(
  url: string,
  timeoutMs: number = 15000
): Promise<string> {
  const token = process.env.BROWSERLESS_API_KEY;
  if (!token) {
    throw new Error("BROWSERLESS_API_KEY is not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://chrome.browserless.io/content?token=${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          waitForTimeout: 2000,
          gotoOptions: {
            waitUntil: "networkidle2",
            timeout: timeoutMs,
          },
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Browserless API error ${response.status}: ${response.statusText}`
      );
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Extracts clean plain text and relevant sub-page URLs from rendered HTML.
 */
export function extractTextAndSublinks(
  html: string,
  baseUrl: string
): { text: string; sublinks: string[] } {
  // 1. Remove script, style, svg, and comment blocks
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  // 2. Extract potential internal navigation links before stripping tags
  const sublinks: string[] = [];
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;

  let baseHostname = "";
  try {
    baseHostname = new URL(baseUrl).hostname.replace(/^www\./, "");
  } catch {
    // Ignore invalid base url
  }

  const candidateKeywords = [
    "about",
    "team",
    "company",
    "culture",
    "careers",
    "jobs",
    "values",
    "engineering",
    "tech",
    "blog",
    "mission",
  ];

  while ((match = hrefRegex.exec(html)) !== null) {
    const rawHref = match[1]?.trim();
    if (
      !rawHref ||
      rawHref.startsWith("#") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:") ||
      rawHref.startsWith("javascript:")
    ) {
      continue;
    }

    try {
      const fullUrl = new URL(rawHref, baseUrl);
      const host = fullUrl.hostname.replace(/^www\./, "");

      // Ensure internal domain and keyword match in path
      if (baseHostname && host === baseHostname) {
        const pathLower = fullUrl.pathname.toLowerCase();
        const matchesKeyword = candidateKeywords.some((kw) =>
          pathLower.includes(kw)
        );

        if (
          matchesKeyword &&
          !sublinks.includes(fullUrl.href) &&
          fullUrl.href !== baseUrl
        ) {
          sublinks.push(fullUrl.href);
        }
      }
    } catch {
      // Invalid URL skipped
    }
  }

  // 3. Strip all HTML tags
  clean = clean.replace(/<[^>]+>/g, " ");

  // 4. Decode HTML entities and collapse whitespace
  clean = clean
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  // Limit text slice for optimal LLM context size
  const text = clean.slice(0, 6000);

  return {
    text,
    sublinks: sublinks.slice(0, 3), // Top 3 relevant sub-page links
  };
}
