import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { StatItem } from "@/components/dashboard/StatsBar";
import { ActivityItem } from "@/components/dashboard/RecentActivity";
import { getDashboardAnalytics } from "@/lib/posthog-analytics";
import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return "Just now";
  if (diffMins === 1) return "1 min ago";
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default async function DashboardPage() {
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

  // Fetch profile for completeness status
  const { data: profile } = await client.database
    .from("profiles")
    .select("id, is_complete, full_name")
    .eq("id", userData.user.id)
    .maybeSingle();

  // Fetch jobs for current user to compute real stats & research activity
  const { data: dbJobs } = await client.database
    .from("jobs")
    .select("id, company, match_score, company_research, found_at")
    .eq("user_id", userData.user.id);

  // Fetch agent search runs for current user
  const { data: dbRuns } = await client.database
    .from("agent_runs")
    .select("id, status, job_title_searched, jobs_found, completed_at, started_at")
    .eq("user_id", userData.user.id)
    .order("started_at", { ascending: false })
    .limit(10);

  const jobsList = (dbJobs || []) as Array<{
    id: string;
    company: string | null;
    match_score: number | null;
    company_research: unknown | null;
    found_at: string | null;
  }>;

  const totalJobs = jobsList.length;

  // 1. Total Jobs Found
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

  const jobsThisWeek = jobsList.filter((j) => {
    if (!j.found_at) return false;
    const t = new Date(j.found_at).getTime();
    return t >= sevenDaysAgo;
  }).length;

  const jobsPriorWeek = jobsList.filter((j) => {
    if (!j.found_at) return false;
    const t = new Date(j.found_at).getTime();
    return t >= fourteenDaysAgo && t < sevenDaysAgo;
  }).length;

  let totalJobsTrend: string | undefined = undefined;
  if (jobsPriorWeek > 0) {
    const diff = Math.round(((jobsThisWeek - jobsPriorWeek) / jobsPriorWeek) * 100);
    totalJobsTrend = `${diff >= 0 ? "+" : ""}${diff}%`;
  } else if (jobsThisWeek > 0) {
    totalJobsTrend = `+${jobsThisWeek}`;
  }

  // 2. Avg. Match Rate
  const validScores = jobsList
    .map((j) => j.match_score)
    .filter((s): s is number => typeof s === "number");

  const avgMatchRate =
    validScores.length > 0
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : 0;

  // Recent vs prior match rate trend
  const recentJobScores = jobsList
    .filter((j) => j.found_at && new Date(j.found_at).getTime() >= sevenDaysAgo)
    .map((j) => j.match_score)
    .filter((s): s is number => typeof s === "number");

  const priorJobScores = jobsList
    .filter((j) => {
      if (!j.found_at) return false;
      const t = new Date(j.found_at).getTime();
      return t < sevenDaysAgo;
    })
    .map((j) => j.match_score)
    .filter((s): s is number => typeof s === "number");

  let matchRateTrend: string | undefined = undefined;
  if (recentJobScores.length > 0 && priorJobScores.length > 0) {
    const recentAvg = Math.round(
      recentJobScores.reduce((sum, score) => sum + score, 0) / recentJobScores.length
    );
    const priorAvg = Math.round(
      priorJobScores.reduce((sum, score) => sum + score, 0) / priorJobScores.length
    );
    const diff = recentAvg - priorAvg;
    matchRateTrend = `${diff >= 0 ? "+" : ""}${diff}%`;
  }

  // 3. Companies Researched
  const researchedCount = jobsList.filter(
    (j) => j.company_research !== null && j.company_research !== undefined
  ).length;

  const stats: StatItem[] = [
    {
      label: "Total Jobs Found",
      value: totalJobs,
      trend: totalJobsTrend,
      subtitle: totalJobs > 0 ? "vs last week" : "Search to discover jobs",
    },
    {
      label: "Avg. Match Rate",
      value: `${avgMatchRate}%`,
      trend: matchRateTrend,
      subtitle: totalJobs > 0 ? "vs last week" : "Based on your profile",
    },
    {
      label: "Companies Researched",
      value: researchedCount,
      subtitle: "Total researched",
    },
    {
      label: "Jobs This Week",
      value: jobsThisWeek,
      subtitle: "New this week",
    },
  ];

  // 4. Recent Activity
  const researchedJobs = jobsList.filter(
    (j) => j.company_research !== null && j.company_research !== undefined && j.company
  );

  type RawActivity = {
    id: string;
    title: string;
    date: string;
    dotColor: "purple" | "blue" | "green";
  };

  const runActivities: RawActivity[] = (dbRuns || []).map((r) => ({
    id: `run-${r.id}`,
    title: `Found ${r.jobs_found ?? 0} jobs for ${r.job_title_searched || "Developer"}`,
    date: r.completed_at || r.started_at || new Date().toISOString(),
    dotColor: (r.jobs_found ?? 0) > 0 ? "green" : "purple",
  }));

  const researchActivities: RawActivity[] = researchedJobs.map((j) => ({
    id: `research-${j.id}`,
    title: `Researched ${j.company}`,
    date: j.found_at || new Date().toISOString(),
    dotColor: "blue",
  }));

  const combinedActivities = [...runActivities, ...researchActivities];
  combinedActivities.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const activities: ActivityItem[] = combinedActivities.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.title,
    timestamp: formatRelativeTime(item.date),
    dotColor: item.dotColor,
  }));

  // 5. PostHog / DB Analytics Charts Data
  const analytics = await getDashboardAnalytics(userData.user.id, jobsList);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow max-w-[1440px] w-full mx-auto px-6 py-8 flex flex-col gap-6">
        <DashboardClient
          profile={profile}
          stats={stats}
          activities={activities}
          jobsOverTime={{
            data: analytics.jobsOverTime.data,
            isEmpty: analytics.jobsOverTime.totalCount === 0,
          }}
          matchScoreDistribution={{
            data: analytics.matchScoreDistribution.data,
            isEmpty: analytics.matchScoreDistribution.totalCount === 0,
          }}
          companyResearch={{
            data: analytics.companyResearch.data,
            isEmpty: analytics.companyResearch.totalCount === 0,
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
