import { Building2 } from "lucide-react";

export type DayData = {
  day: string;
  count: number;
};

type Props = {
  data?: DayData[];
  isEmpty?: boolean;
};

const DEFAULT_DATA: DayData[] = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 5 },
  { day: "Wed", count: 3 },
  { day: "Thu", count: 8 },
  { day: "Fri", count: 12 },
  { day: "Sat", count: 4 },
  { day: "Sun", count: 1 },
];

export function CompanyResearchChart({ data = DEFAULT_DATA, isEmpty }: Props) {
  const isDataEmpty = isEmpty || data.length === 0 || data.every((d) => d.count === 0);

  const chartHeight = 180;
  const chartWidth = 460;
  const paddingLeft = 32;
  const paddingBottom = 30;
  const paddingTop = 10;
  const plotHeight = chartHeight - paddingTop;

  const maxVal = Math.max(...data.map((d) => d.count), 0);
  const rawMax = maxVal > 0 ? Math.ceil(maxVal * 1.25) : 8;
  const maxY = Math.max(8, Math.ceil(rawMax / 4) * 4);
  const yTicks = [maxY, Math.round(maxY * 0.75), Math.round(maxY * 0.5), Math.round(maxY * 0.25), 0];

  const barWidth = 26;
  const availableWidth = chartWidth - paddingLeft;
  const step = data.length > 0 ? availableWidth / data.length : availableWidth;

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-text-primary">
          Company Research Activity
        </h3>
        <span className="text-xs text-text-muted font-medium">Last 7 days</span>
      </div>

      <div className="w-full flex-1 flex items-center justify-center min-h-[220px]">
        {isDataEmpty ? (
          <div className="flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center text-info mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">
              No company research yet
            </h4>
            <p className="text-xs text-text-secondary max-w-xs">
              Generate AI dossiers for companies on the job details page to track research activity.
            </p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${chartWidth + 20} ${chartHeight + paddingBottom}`}
            className="w-full h-full max-h-[260px] overflow-visible"
          >
            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((val) => {
              const y = paddingTop + (1 - val / maxY) * plotHeight;
              return (
                <g key={val}>
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#9CA3AF"
                    fontSize="12"
                    fontFamily="Inter, sans-serif"
                  >
                    {val}
                  </text>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth + 10}
                    y2={y}
                    stroke="#E7EAF3"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                </g>
              );
            })}

            {/* Bars & X-Axis Labels */}
            {data.map((item, index) => {
              const xCenter = paddingLeft + step * index + step / 2;
              const barH = (item.count / maxY) * plotHeight;
              const y = paddingTop + plotHeight - barH;

              return (
                <g key={item.day} className="group cursor-pointer">
                  {/* Bar */}
                  <rect
                    x={xCenter - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx="3"
                    ry="3"
                    fill="#61A8FF"
                    className="transition-opacity hover:opacity-85"
                  >
                    <title>{`${item.day}: ${item.count} companies researched`}</title>
                  </rect>

                  {/* X-Axis Label */}
                  <text
                    x={xCenter}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    fill="#9CA3AF"
                    fontSize="12"
                    fontFamily="Inter, sans-serif"
                  >
                    {item.day}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
