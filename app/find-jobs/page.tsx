import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FindJobsClient } from "@/components/jobs/FindJobsClient";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default async function FindJobsPage() {
  const cookieStore = await cookies();
  const client = createServerClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    cookies: cookieStore,
  });

  const { data: userData, error: userError } = await client.auth.getCurrentUser();
  if (userError || !userData?.user) {
    redirect("/login");
  }

  const { data: dbJobs } = await client.database
    .from("jobs")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("found_at", { ascending: false });

  const initialJobs = (dbJobs || []).map((j: {
    id: string;
    company: string;
    title: string;
    match_score: number;
    salary: string | null;
    source: "search" | "url";
    found_at?: string;
  }) => ({
    id: j.id,
    company: j.company,
    role: j.title,
    matchScore: j.match_score,
    salaryEst: j.salary || "Competitive",
    dateFound: formatRelativeTime(j.found_at),
    foundAt: j.found_at || new Date().toISOString(),
    source: j.source || "search",
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow max-w-[1280px] w-full mx-auto px-6 py-8 flex flex-col gap-6">
        <FindJobsClient initialJobs={initialJobs} />
      </main>
      <Footer />
    </div>
  );
}
