"use client";

import { useState, useRef } from "react";
import { TrendingUp, Briefcase } from "lucide-react";

export type DayPoint = {
  day: string;
  value: number;
};

type Props = {
  data?: DayPoint[];
  isEmpty?: boolean;
};

const DEFAULT_DATA: DayPoint[] = [
  { day: "Mon", value: 12 },
  { day: "Tue", value: 45 },
  { day: "Wed", value: 32 },
  { day: "Thu", value: 60 },
  { day: "Fri", value: 85 },
  { day: "Sat", value: 45 },
  { day: "Sun", value: 10 },
];

/**
 * Generates smooth SVG cubic bezier curve commands through an array of [x, y] coordinates.
 * Clamps all control points so the curve never dips below the baseline or above chart ceiling.
 */
function getClampedSplinePath(points: [number, number][], bottomY: number, topY: number): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;

  let path = `M ${points[0][0]} ${points[0][1]}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const prev = points[i - 1] || current;
    const nextNext = points[i + 2] || next;

    // Catmull-Rom to Cubic Bezier conversion factor
    let cp1x = current[0] + (next[0] - prev[0]) / 6;
    let cp1y = current[1] + (next[1] - prev[1]) / 6;
    let cp2x = next[0] - (nextNext[0] - current[0]) / 6;
    let cp2y = next[1] - (nextNext[1] - current[1]) / 6;

    // Clamp control points between top ceiling and bottom baseline
    // If both adjacent points are at baseline, keep control points strictly on baseline (prevent undershoot)
    if (current[1] >= bottomY && next[1] >= bottomY) {
      cp1y = bottomY;
      cp2y = bottomY;
    } else {
      cp1y = Math.min(bottomY, Math.max(topY, cp1y));
      cp2y = Math.min(bottomY, Math.max(topY, cp2y));
    }

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${next[0].toFixed(2)} ${next[1].toFixed(2)}`;
  }

  return path;
}

export function JobsOverTimeChart({ data = DEFAULT_DATA, isEmpty }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDataEmpty = isEmpty || data.length === 0 || data.every((d) => d.value === 0);

  const chartHeight = 180;
  const chartWidth = 660;
  const paddingLeft = 36;
  const paddingBottom = 30;
  const paddingTop = 12;
  const plotHeight = chartHeight - paddingTop;
  const bottomY = paddingTop + plotHeight;

  // Compute dynamic maxY and sensible ticks
  const maxVal = Math.max(...data.map((d) => d.value), 0);
  const rawMax = maxVal > 0 ? Math.ceil(maxVal * 1.25) : 10;
  const maxY = Math.max(10, Math.ceil(rawMax / 4) * 4);
  const yTicks = [maxY, Math.round(maxY * 0.75), Math.round(maxY * 0.5), Math.round(maxY * 0.25), 0];

  const availableWidth = chartWidth - paddingLeft;
  const step = data.length > 1 ? availableWidth / (data.length - 1) : availableWidth;

  // Calculate points
  const points: [number, number][] = data.map((item, index) => {
    const x = paddingLeft + step * index;
    const y = paddingTop + (1 - item.value / maxY) * plotHeight;
    return [x, y];
  });

  const linePath = points.length > 0 ? getClampedSplinePath(points, bottomY, paddingTop) : "";

  // Area path: starts at first point, follows spline, drops to bottom right, goes to bottom left, closes
  const firstX = points[0]?.[0] ?? paddingLeft;
  const lastX = points[points.length - 1]?.[0] ?? chartWidth;
  const areaPath = points.length > 0 ? `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z` : "";

  // Helper for skipping x-axis labels if many points (e.g. 30 days)
  const labelInterval = data.length > 10 ? Math.ceil(data.length / 6) : 1;

  // Mouse move handler over SVG to find nearest point
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const svgX = (mouseX / svgRect.width) * (chartWidth + 20);

    // Find closest data point by X coordinate
    let closestIdx = 0;
    let minDistance = Infinity;

    points.forEach(([px], idx) => {
      const dist = Math.abs(px - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;
  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div
      ref={containerRef}
      className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col h-full relative"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-text-primary">
          Jobs Found Over Time
        </h3>
        <span className="text-xs text-text-muted font-medium">Last 30 days</span>
      </div>

      <div className="w-full flex-1 flex items-center justify-center min-h-[220px] relative">
        {isDataEmpty ? (
          <div className="flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-text-primary mb-1">
              No jobs discovered yet
            </h4>
            <p className="text-xs text-text-secondary max-w-xs">
              Search and discover jobs to track your discovery trend over time.
            </p>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <svg
              viewBox={`0 0 ${chartWidth + 20} ${chartHeight + paddingBottom}`}
              className="w-full h-full max-h-[260px] overflow-visible cursor-crosshair select-none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C5CFC" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#7C5CFC" stopOpacity="0.0" />
                </linearGradient>
              </defs>

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

              {/* Gradient Area Fill */}
              <path d={areaPath} fill="url(#jobsGradient)" />

              {/* Smooth Clamped Line Curve */}
              <path
                d={linePath}
                fill="none"
                stroke="#7C5CFC"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Static subtle baseline dots only where value > 0 */}
              {points.map(([px, py], index) => {
                const val = data[index].value;
                if (val === 0) return null;
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={px}
                    cy={py}
                    r="4"
                    fill="#7C5CFC"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="pointer-events-none"
                  />
                );
              })}

              {/* Hover Crosshair Line & Glowing Highlight Dot */}
              {activePoint && (
                <g className="pointer-events-none transition-all duration-75">
                  {/* Vertical Guideline */}
                  <line
                    x1={activePoint[0]}
                    y1={paddingTop}
                    x2={activePoint[0]}
                    y2={bottomY}
                    stroke="#7C5CFC"
                    strokeDasharray="3 3"
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                  />

                  {/* Outer Glow Halo */}
                  <circle
                    cx={activePoint[0]}
                    cy={activePoint[1]}
                    r="10"
                    fill="#7C5CFC"
                    fillOpacity="0.2"
                  />

                  {/* Inner Active Point */}
                  <circle
                    cx={activePoint[0]}
                    cy={activePoint[1]}
                    r="5"
                    fill="#7C5CFC"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                </g>
              )}

              {/* Interactive Tooltip rendered inside SVG to guarantee perfect coordinate alignment */}
              {activePoint && activeItem && (
                <g
                  className="pointer-events-none"
                  transform={`translate(${
                    activePoint[0] > chartWidth - 110
                      ? activePoint[0] - 120
                      : activePoint[0] < paddingLeft + 50
                      ? activePoint[0] + 12
                      : activePoint[0] - 55
                  }, ${Math.max(paddingTop - 6, activePoint[1] - 52)})`}
                >
                  {/* Tooltip Background Card */}
                  <rect
                    width="110"
                    height="44"
                    rx="8"
                    ry="8"
                    fill="#1E1B4B"
                    className="shadow-lg filter drop-shadow-md"
                  />
                  {/* Tooltip Date */}
                  <text
                    x="10"
                    y="17"
                    fill="#C7D2FE"
                    fontSize="11"
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                  >
                    {activeItem.day}
                  </text>
                  {/* Tooltip Value */}
                  <text
                    x="10"
                    y="34"
                    fill="#FFFFFF"
                    fontSize="13"
                    fontFamily="Inter, sans-serif"
                    fontWeight="700"
                  >
                    {`${activeItem.value} ${activeItem.value === 1 ? "job" : "jobs"} found`}
                  </text>
                </g>
              )}

              {/* X-Axis Labels */}
              {data.map((item, index) => {
                const [x] = points[index];
                const showLabel =
                  index === 0 ||
                  index === data.length - 1 ||
                  index % labelInterval === 0;

                if (!showLabel) return null;

                return (
                  <text
                    key={item.day}
                    x={x}
                    y={chartHeight + 20}
                    textAnchor="middle"
                    fill={hoveredIndex === index ? "#7C5CFC" : "#9CA3AF"}
                    fontWeight={hoveredIndex === index ? "600" : "400"}
                    fontSize="12"
                    fontFamily="Inter, sans-serif"
                    className="pointer-events-none transition-colors"
                  >
                    {item.day}
                  </text>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
