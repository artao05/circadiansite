"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceArea,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatClockTime,
  formatElapsedHours,
  type SleepWindow,
  type SleepDatum,
} from "../lib/sleep-model";
import type { SandboxChartColors } from "../lib/sandbox-themes";

type SleepModelChartProps = {
  data: SleepDatum[];
  currentTime: number;
  cursorLabel: string;
  horizon: number;
  showBiologicalTime?: boolean;
  sleepWindows: SleepWindow[];
  ticks: number[];
  colors: SandboxChartColors;
};

type TooltipPayload = {
  name?: string;
  value?: number;
  color?: string;
  payload?: SleepDatum;
};

type ChartSize = {
  width: number;
  height: number;
};

function ChartTooltip({
  active,
  payload,
  label,
  showBiologicalTime = false,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: number | string;
  showBiologicalTime?: boolean;
}) {
  if (!active || !payload?.length || typeof label === "undefined") return null;

  const numericLabel = Number(label);
  const point = payload[0]?.payload;

  return (
    <div className="sleep-tooltip">
      <strong>
        {point?.clockLabel ??
          (Number.isFinite(numericLabel) ? formatClockTime(numericLabel) : label)}
      </strong>
      <span>
        {point
          ? showBiologicalTime
            ? `${formatElapsedHours(point.hour)} into model · biological ${point.biologicalLabel}`
            : `${point.hour.toFixed(1)} hours into the model · ${point.clockLabel}`
          : Number.isFinite(numericLabel)
            ? `${numericLabel.toFixed(1)} hours into the model`
            : ""}
      </span>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {Math.round(entry.value ?? 0)}%
        </p>
      ))}
    </div>
  );
}

export function SleepModelChart({
  data,
  currentTime,
  cursorLabel,
  horizon,
  showBiologicalTime = false,
  sleepWindows,
  ticks,
  colors,
}: SleepModelChartProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState<ChartSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateSize = () => {
      const rect = frame.getBoundingClientRect();
      const nextSize = {
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
      };

      setChartSize((current) =>
        current.width === nextSize.width && current.height === nextSize.height
          ? current
          : nextSize,
      );
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(frame);

    return () => observer.disconnect();
  }, []);

  const chartIsReady = chartSize.width > 0 && chartSize.height > 0;

  return (
    <div
      className="sleep-chart-frame"
      aria-label="Two-process sleep model chart"
      ref={frameRef}
    >
      {chartIsReady ? (
        <AreaChart
          data={data}
          height={chartSize.height}
          margin={{ top: 24, right: 18, left: 0, bottom: 22 }}
          width={chartSize.width}
        >
          <defs>
            <linearGradient id="feltSleepGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.feltS} stopOpacity={0.52} />
              <stop offset="95%" stopColor={colors.feltS} stopOpacity={0.08} />
            </linearGradient>
            <linearGradient id="wakeDriveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.processC} stopOpacity={0.5} />
              <stop offset="95%" stopColor={colors.processC} stopOpacity={0.08} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="hour"
            type="number"
            domain={[0, horizon]}
            ticks={ticks}
            tickFormatter={(value) => formatElapsedHours(Number(value))}
            tick={{ fill: colors.text, fontSize: 12, fontWeight: 700 }}
            axisLine={{ stroke: colors.grid }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: colors.text, fontSize: 12, fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
            width={38}
            tickFormatter={(value) => `${value}%`}
          />

          {sleepWindows.map((window) => (
            <ReferenceArea
              key={`${window.start}-${window.end}`}
              x1={window.start}
              x2={window.end}
              y1={0}
              y2={100}
              fill={colors.sleep}
              fillOpacity={0.08}
              strokeOpacity={0}
              label={
                chartSize.width < 520 || window.start < horizon * 0.24
                  ? undefined
                  : {
                      value: window.label,
                      position: "insideTop",
                      fill: colors.text,
                      fontSize: 11,
                      fontWeight: 800,
                    }
              }
            />
          ))}

          <Area
            type="monotone"
            dataKey="processC"
            name="Wake Drive (C)"
            stroke={colors.processC}
            strokeWidth={2}
            fill="url(#wakeDriveGradient)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="feltS"
            name="Felt Sleep Pressure"
            stroke={colors.feltS}
            strokeWidth={3}
            fill="url(#feltSleepGradient)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="processS"
            name="True Adenosine"
            stroke={colors.processS}
            strokeWidth={2}
            strokeDasharray="7 7"
            dot={false}
            activeDot={false}
          />
          <ReferenceLine
            x={currentTime}
            stroke={colors.cursor}
            strokeWidth={2}
            label={{
              value: cursorLabel,
              position: "top",
              fill: colors.cursor,
              fontSize: 12,
              fontWeight: 900,
            }}
          />
          <Tooltip content={<ChartTooltip showBiologicalTime={showBiologicalTime} />} />
        </AreaChart>
      ) : (
        <div className="sleep-chart-empty" aria-hidden="true" />
      )}
    </div>
  );
}
