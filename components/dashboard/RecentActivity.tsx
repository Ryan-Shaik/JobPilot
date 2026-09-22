import { Clock } from "lucide-react";

export type ActivityItem = {
  id: string;
  title: string;
  timestamp: string;
  dotColor: "purple" | "blue" | "green";
};

type Props = {
  activities?: ActivityItem[];
};

export const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    title: "Found 8 jobs for Frontend Engineer",
    timestamp: "10 mins ago",
    dotColor: "purple",
  },
  {
    id: "2",
    title: "Researched Stripe",
    timestamp: "1 hour ago",
    dotColor: "blue",
  },
  {
    id: "3",
    title: "Found 12 jobs for React Developer",
    timestamp: "2 hours ago",
    dotColor: "green",
  },
  {
    id: "4",
    title: "Researched Vercel",
    timestamp: "Yesterday",
    dotColor: "purple",
  },
  {
    id: "5",
    title: "Found 10 jobs for Full Stack Engineer",
    timestamp: "Yesterday",
    dotColor: "green",
  },
];

const DOT_COLOR_MAP = {
  purple: "bg-accent ring-[#F3E8FF]",
  blue: "bg-info ring-[#DBEAFE]",
  green: "bg-success ring-[#D0FAE5]",
};

export function RecentActivity({ activities = DEFAULT_ACTIVITIES }: Props) {
  const hasActivities = activities.length > 0;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col h-full">
      <h3 className="text-base font-semibold text-text-primary mb-6">
        Recent Activity
      </h3>

      {!hasActivities ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <Clock className="w-8 h-8 text-text-muted mb-2 stroke-[1.5]" />
          <p className="text-sm font-medium text-text-secondary">
            No recent activity yet
          </p>
          <p className="text-xs text-text-muted mt-1 max-w-[240px]">
            Run a job search or research a company to build your activity timeline.
          </p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 justify-between py-1">
          {activities.map((item, index) => {
            const isLast = index === activities.length - 1;
            return (
              <div key={item.id} className="relative flex items-start gap-4">
                {/* Timeline dot & vertical connector line */}
                <div className="relative flex flex-col items-center self-stretch">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ring-4 ${
                      DOT_COLOR_MAP[item.dotColor] || "bg-accent ring-[#F3E8FF]"
                    }`}
                  />
                  {!isLast && (
                    <div className="w-[1px] bg-border-light flex-1 my-1" />
                  )}
                </div>

                {/* Item Content */}
                <div className={`${isLast ? "pb-1" : "pb-6"} flex flex-col`}>
                  <span className="text-sm font-medium text-text-primary leading-tight">
                    {item.title}
                  </span>
                  <span className="text-xs text-text-muted mt-1 leading-none">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
