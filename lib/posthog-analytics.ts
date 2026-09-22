/**
 * lib/posthog-analytics.ts
 *
 * Analytics service for Dashboard charts (Feature 17).
 * Queries PostHog events (job_found, company_researched) via HogQL when
 * POSTHOG_PERSONAL_API_KEY is configured, or falls back to InsForge jobs table.
 */

export type JobsOverTimePoint = {
  day: string;
  value: number;
};

export type MatchScoreBucket = {
  range: string;
  count: number;
};

export type CompanyResearchPoint = {
  day: string;
  count: number;
};

export type DashboardAnalytics = {
  jobsOverTime: {
    data: JobsOverTimePoint[];
    totalCount: number;
  };
  matchScoreDistribution: {
    data: MatchScoreBucket[];
    totalCount: number;
  };
  companyResearch: {
    data: CompanyResearchPoint[];
    totalCount: number;
  };
};

type DBJob = {
  id?: string;
  found_at?: string | null;
  match_score?: number | null;
  company_research?: unknown | null;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Generates continuous last N days array in YYYY-MM-DD format
 */
function getLastNDays(n: number): { isoDate: string; label: string; dayOfWeek: string }[] {
  const days = [];
  const now = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const isoDate = d.toISOString().split("T")[0];
    const month = d.toLocaleString("en-US", { month: "short" });
    const dateNum = d.getDate();
    const dayOfWeek = DAY_NAMES[d.getDay()];

    days.push({
      isoDate,
      label: `${month} ${dateNum}`,
      dayOfWeek,
    });
  }
  return days;
}

/**
 * Computes analytics from InsForge database jobs records (reliable fallback).
 */
function computeFromDbJobs(dbJobs: DBJob[]): DashboardAnalytics {
  // 1. Jobs Found Over Time (Last 30 Days)
  const last30Days = getLastNDays(30);
  const jobsByDayMap: Record<string, number> = {};
  last30Days.forEach((d) => {
    jobsByDayMap[d.isoDate] = 0;
  });

  let totalJobsFound = 0;
  dbJobs.forEach((job) => {
    if (!job.found_at) return;
    totalJobsFound++;
    const jobDate = job.found_at.split("T")[0];
    if (jobsByDayMap[jobDate] !== undefined) {
      jobsByDayMap[jobDate]++;
    }
  });

  // Pick 7 evenly spaced sample points or display days of week if under 8 days
  const jobsOverTimeData: JobsOverTimePoint[] = last30Days.map((d) => ({
    day: d.label,
    value: jobsByDayMap[d.isoDate] || 0,
  }));

  // 2. Match Score Distribution (5 buckets: 50-60%, 60-70%, 70-80%, 80-90%, 90-100%)
  const buckets: Record<string, number> = {
    "50-60%": 0,
    "60-70%": 0,
    "70-80%": 0,
    "80-90%": 0,
    "90-100%": 0,
  };

  let validScoresCount = 0;
  dbJobs.forEach((job) => {
    if (typeof job.match_score !== "number" || isNaN(job.match_score)) return;
    validScoresCount++;
    const score = job.match_score;
    if (score >= 90) {
      buckets["90-100%"]++;
    } else if (score >= 80) {
      buckets["80-90%"]++;
    } else if (score >= 70) {
      buckets["70-80%"]++;
    } else if (score >= 60) {
      buckets["60-70%"]++;
    } else if (score >= 50) {
      buckets["50-60%"]++;
    }
  });

  const matchScoreDistributionData: MatchScoreBucket[] = Object.entries(buckets).map(
    ([range, count]) => ({ range, count })
  );

  // 3. Company Research Activity (Last 7 Days)
  const last7Days = getLastNDays(7);
  const researchByDayMap: Record<string, number> = {};
  last7Days.forEach((d) => {
    researchByDayMap[d.isoDate] = 0;
  });

  let totalResearched = 0;
  dbJobs.forEach((job) => {
    if (!job.company_research || !job.found_at) return;
    totalResearched++;
    const researchDate = job.found_at.split("T")[0];
    if (researchByDayMap[researchDate] !== undefined) {
      researchByDayMap[researchDate]++;
    }
  });

  const companyResearchData: CompanyResearchPoint[] = last7Days.map((d) => ({
    day: d.dayOfWeek,
    count: researchByDayMap[d.isoDate] || 0,
  }));

  return {
    jobsOverTime: {
      data: jobsOverTimeData,
      totalCount: totalJobsFound,
    },
    matchScoreDistribution: {
      data: matchScoreDistributionData,
      totalCount: validScoresCount,
    },
    companyResearch: {
      data: companyResearchData,
      totalCount: totalResearched,
    },
  };
}

/**
 * Queries PostHog API via HogQL endpoint for live analytics.
 */
async function queryPostHogHogQL(
  apiKey: string,
  projectId: string,
  hogQLQuery: string
): Promise<unknown[][] | null> {
  try {
    const res = await fetch(`https://us.posthog.com/api/projects/${projectId}/query/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query: hogQLQuery,
        },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[posthog-analytics] HogQL query returned ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    return data?.results || null;
  } catch (err) {
    console.warn("[posthog-analytics] Error executing HogQL query:", err);
    return null;
  }
}

/**
 * Main dashboard analytics aggregator.
 * Attempts PostHog HogQL queries; gracefully falls back to database records.
 */
export async function getDashboardAnalytics(
  userId: string,
  dbJobs: DBJob[]
): Promise<DashboardAnalytics> {
  const posthogApiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const posthogProjectId = process.env.POSTHOG_PROJECT_ID || "487331";

  // Fall back to database if PostHog personal key is not present
  if (!posthogApiKey) {
    return computeFromDbJobs(dbJobs);
  }

  try {
    // 1. Query Jobs Found Over Time (Last 30 Days)
    const jobsOverTimeQuery = `
      SELECT toDate(timestamp) AS day, count() AS cnt
      FROM events
      WHERE event = 'job_found'
        AND distinct_id = '${userId}'
        AND timestamp >= now() - INTERVAL 30 DAY
      GROUP BY day
      ORDER BY day ASC
    `;

    // 2. Query Match Score Distribution
    const scoresQuery = `
      SELECT toFloat(properties.match_score) AS score
      FROM events
      WHERE event = 'job_found'
        AND distinct_id = '${userId}'
        AND properties.match_score IS NOT NULL
    `;

    // 3. Query Company Research Activity (Last 7 Days)
    const researchQuery = `
      SELECT toDate(timestamp) AS day, count() AS cnt
      FROM events
      WHERE event = 'company_researched'
        AND distinct_id = '${userId}'
        AND timestamp >= now() - INTERVAL 7 DAY
      GROUP BY day
      ORDER BY day ASC
    `;

    const [jobsResults, scoresResults, researchResults] = await Promise.all([
      queryPostHogHogQL(posthogApiKey, posthogProjectId, jobsOverTimeQuery),
      queryPostHogHogQL(posthogApiKey, posthogProjectId, scoresQuery),
      queryPostHogHogQL(posthogApiKey, posthogProjectId, researchQuery),
    ]);

    // If any query failed, fall back to DB computation
    if (!jobsResults || !scoresResults || !researchResults) {
      return computeFromDbJobs(dbJobs);
    }

    // Process Jobs Over Time
    const last30Days = getLastNDays(30);
    const posthogJobsMap: Record<string, number> = {};
    last30Days.forEach((d) => {
      posthogJobsMap[d.isoDate] = 0;
    });

    let totalJobsCount = 0;
    jobsResults.forEach((row) => {
      const dateStr = String(row[0]);
      const count = Number(row[1]) || 0;
      totalJobsCount += count;
      if (posthogJobsMap[dateStr] !== undefined) {
        posthogJobsMap[dateStr] = count;
      }
    });

    const jobsOverTimeData: JobsOverTimePoint[] = last30Days.map((d) => ({
      day: d.label,
      value: posthogJobsMap[d.isoDate] || 0,
    }));

    // Process Match Scores
    const buckets: Record<string, number> = {
      "50-60%": 0,
      "60-70%": 0,
      "70-80%": 0,
      "80-90%": 0,
      "90-100%": 0,
    };

    let totalScoresCount = 0;
    scoresResults.forEach((row) => {
      const score = Number(row[0]);
      if (isNaN(score)) return;
      totalScoresCount++;
      if (score >= 90) {
        buckets["90-100%"]++;
      } else if (score >= 80) {
        buckets["80-90%"]++;
      } else if (score >= 70) {
        buckets["70-80%"]++;
      } else if (score >= 60) {
        buckets["60-70%"]++;
      } else if (score >= 50) {
        buckets["50-60%"]++;
      }
    });

    const matchScoreDistributionData: MatchScoreBucket[] = Object.entries(buckets).map(
      ([range, count]) => ({ range, count })
    );

    // Process Company Research
    const last7Days = getLastNDays(7);
    const posthogResearchMap: Record<string, number> = {};
    last7Days.forEach((d) => {
      posthogResearchMap[d.isoDate] = 0;
    });

    let totalResearchCount = 0;
    researchResults.forEach((row) => {
      const dateStr = String(row[0]);
      const count = Number(row[1]) || 0;
      totalResearchCount += count;
      if (posthogResearchMap[dateStr] !== undefined) {
        posthogResearchMap[dateStr] = count;
      }
    });

    const companyResearchData: CompanyResearchPoint[] = last7Days.map((d) => ({
      day: d.dayOfWeek,
      count: posthogResearchMap[d.isoDate] || 0,
    }));

    return {
      jobsOverTime: {
        data: jobsOverTimeData,
        totalCount: totalJobsCount,
      },
      matchScoreDistribution: {
        data: matchScoreDistributionData,
        totalCount: totalScoresCount,
      },
      companyResearch: {
        data: companyResearchData,
        totalCount: totalResearchCount,
      },
    };
  } catch (err) {
    console.warn("[posthog-analytics] Error aggregating PostHog data:", err);
    return computeFromDbJobs(dbJobs);
  }
}
