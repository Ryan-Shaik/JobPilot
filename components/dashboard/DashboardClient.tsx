import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { StatsBar, StatItem } from "@/components/dashboard/StatsBar";
import { RecentActivity, ActivityItem } from "@/components/dashboard/RecentActivity";
import { CompanyResearchChart, DayData } from "@/components/dashboard/CompanyResearchChart";
import { JobsOverTimeChart, DayPoint } from "@/components/dashboard/JobsOverTimeChart";
import { MatchScoreDistributionChart, BucketData } from "@/components/dashboard/MatchScoreDistributionChart";

type Profile = {
  id?: string;
  is_complete?: boolean;
  full_name?: string | null;
} | null;

type Props = {
  profile?: Profile;
  stats?: StatItem[];
  activities?: ActivityItem[];
  jobsOverTime?: {
    data: DayPoint[];
    isEmpty?: boolean;
  };
  matchScoreDistribution?: {
    data: BucketData[];
    isEmpty?: boolean;
  };
  companyResearch?: {
    data: DayData[];
    isEmpty?: boolean;
  };
};

export function DashboardClient({
  profile,
  stats,
  activities,
  jobsOverTime,
  matchScoreDistribution,
  companyResearch,
}: Props) {
  const showIncompleteBanner = profile && !profile.is_complete;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Optional Incomplete Profile Alert Banner */}
      {showIncompleteBanner && (
        <div className="bg-surface border border-warning/30 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center text-warning shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">
                Your profile is incomplete
              </h4>
              <p className="text-xs text-text-secondary mt-0.5">
                Complete your skills and experience to unlock AI-powered matching accuracy.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent-dark transition-colors shrink-0"
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Row 1: 4 Stat Cards */}
      <StatsBar stats={stats} />

      {/* Row 2: Recent Activity & Company Research Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <RecentActivity activities={activities} />
        <CompanyResearchChart
          data={companyResearch?.data}
          isEmpty={companyResearch?.isEmpty}
        />
      </div>

      {/* Row 3: Jobs Found Over Time & Match Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <JobsOverTimeChart
            data={jobsOverTime?.data}
            isEmpty={jobsOverTime?.isEmpty}
          />
        </div>
        <div className="lg:col-span-1">
          <MatchScoreDistributionChart
            data={matchScoreDistribution?.data}
            isEmpty={matchScoreDistribution?.isEmpty}
          />
        </div>
      </div>
    </div>
  );
}
