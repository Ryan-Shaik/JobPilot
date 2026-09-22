export type StatItem = {
  label: string;
  value: string | number;
  trend?: string;
  subtitle: string;
};

type Props = {
  stats?: StatItem[];
};

export const DEFAULT_STATS: StatItem[] = [
  {
    label: "Total Jobs Found",
    value: "284",
    trend: "+12%",
    subtitle: "vs last week",
  },
  {
    label: "Avg. Match Rate",
    value: "82%",
    trend: "+3%",
    subtitle: "vs last week",
  },
  {
    label: "Companies Researched",
    value: "35",
    subtitle: "Total researched",
  },
  {
    label: "Jobs This Week",
    value: "28",
    subtitle: "New this week",
  },
];

export function StatsBar({ stats = DEFAULT_STATS }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const isNegative = stat.trend?.startsWith("-");

        return (
          <div
            key={stat.label}
            className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col justify-between"
          >
            <div>
              <span className="text-sm font-medium text-text-secondary">
                {stat.label}
              </span>
              <div className="text-[30px] font-semibold text-text-primary leading-[36px] mt-1.5 tracking-tight">
                {stat.value}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              {stat.trend && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-semibold ${
                    isNegative
                      ? "bg-[#FEF2F2] text-error"
                      : "bg-[#ECFDF5] text-[#009966]"
                  }`}
                >
                  {stat.trend}
                </span>
              )}
              <span className="text-xs text-text-muted leading-4">
                {stat.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
