export interface AdzunaJob {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string; area?: string[] };
  description: string; // snippet
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: "0" | "1";
  contract_type?: string;
  contract_time?: string;
  created: string;
  category?: { tag: string; label: string };
}

/**
 * Detects appropriate Adzuna country code from location string. Defaults to 'us'.
 */
export function detectCountry(location?: string): string {
  if (!location) return "us";
  const loc = location.toLowerCase();
  if (
    loc.includes("uk") ||
    loc.includes("united kingdom") ||
    loc.includes("london") ||
    loc.includes("england") ||
    loc.includes("scotland")
  ) {
    return "gb";
  }
  if (
    loc.includes("canada") ||
    loc.includes("toronto") ||
    loc.includes("vancouver") ||
    loc.includes("montreal")
  ) {
    return "ca";
  }
  if (
    loc.includes("australia") ||
    loc.includes("sydney") ||
    loc.includes("melbourne") ||
    loc.includes("brisbane")
  ) {
    return "au";
  }
  if (loc.includes("germany") || loc.includes("berlin") || loc.includes("munich")) {
    return "de";
  }
  if (loc.includes("france") || loc.includes("paris")) {
    return "fr";
  }
  if (
    loc.includes("india") ||
    loc.includes("bangalore") ||
    loc.includes("mumbai") ||
    loc.includes("delhi")
  ) {
    return "in";
  }
  return "us";
}

/**
 * Searches jobs via the Adzuna API across all categories based on keyword and location.
 */
export async function searchJobs(
  jobTitle: string,
  location?: string,
  customCountry?: string
): Promise<AdzunaJob[]> {
  const appId = (process.env.ADZUNA_APP_ID || "").trim();
  const appKey = (process.env.ADZUNA_APP_KEY || "").trim();

  if (!appId || !appKey) {
    throw new Error("Adzuna API credentials (ADZUNA_APP_ID, ADZUNA_APP_KEY) are not configured.");
  }

  const country = customCountry || detectCountry(location);
  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: "10",
    "content-type": "application/json",
  });

  if (jobTitle && jobTitle.trim()) {
    params.set("what", jobTitle.trim());
  }

  // Only pass 'where' if non-empty and not pure "Remote"
  if (location && location.trim() && !location.toLowerCase().startsWith("remote")) {
    params.set("where", location.trim());
  }

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(
      `Adzuna API error (${response.status}): ${errText || response.statusText}`
    );
  }

  const data = await response.json();
  return (data.results || []) as AdzunaJob[];
}
