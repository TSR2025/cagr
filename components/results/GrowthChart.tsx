"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis
} from "recharts";
import { ProjectionResult } from "@/lib/calculations/calculateProjection";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { MIN_AGE, MIN_CONTRIB_WINDOW_YEARS, SNAP_INCREMENT_YEARS } from "@/lib/timeModel";
import { TimeControls } from "../TimeControls";

interface GrowthChartProps {
  data: ProjectionResult;
  timePulseSignal: number;
  onStartingAgeChange: (age: number) => void;
  onContributionEndAgeChange: (age: number) => void;
}

export function GrowthChart({ data, timePulseSignal, onStartingAgeChange, onContributionEndAgeChange }: GrowthChartProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  const xTicks = useMemo(() => {
    return data.yearly
      .filter((record) => (record.age - data.startingAge) % SNAP_INCREMENT_YEARS === 0 || record.year === data.totalYears)
      .map((record) => record.year);
  }, [data]);

  useEffect(() => {
    if (timePulseSignal === 0) return;
    setIsPulsing(true);
    const timeout = window.setTimeout(() => setIsPulsing(false), 360);
    return () => window.clearTimeout(timeout);
  }, [timePulseSignal]);

  const stopYear = data.contributionEndAge - data.startingAge;

  return (
    <div className={clsx("chart-shell w-full rounded-2xl border border-slate-200 bg-white/90 p-5", isPulsing && "time-axis-pulse")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Balance over time</h3>
          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-600 sm:ml-1">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden />
              <span>Contributions</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
              <span>Growth</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-3">
        <div className="plot-area relative h-[340px] w-full overflow-hidden sm:h-[380px]">
          <div className="pointer-events-auto absolute inset-x-3 top-3 z-10 mx-auto max-w-[320px] sm:left-3 sm:right-auto sm:mx-0 sm:max-w-[280px]">
            <div className="rounded-xl border border-slate-200/80 bg-white/85 p-2 shadow-md backdrop-blur-sm">
              <TimeControls
                startingAge={data.startingAge}
                onStartingAgeChange={onStartingAgeChange}
                stopContributingAge={data.contributionEndAge}
                onStopContributingAgeChange={onContributionEndAgeChange}
                minAge={MIN_AGE}
                maxAge={data.projectionEndAge}
                minWindowYears={MIN_CONTRIB_WINDOW_YEARS}
                snapIncrementYears={SNAP_INCREMENT_YEARS}
                className="w-full"
              />
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.yearly} margin={{ top: 12, left: 8, right: 8, bottom: 24 }}>
              <defs>
                <linearGradient id="contributions" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="growth" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                ticks={xTicks}
                tickFormatter={(year) => `Age ${data.startingAge + Number(year)}`}
                tick={{ fill: "#475569", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fill: "#475569", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceArea x1={stopYear} x2={data.totalYears} fill="#0f172a" fillOpacity={0.04} />
              <ReferenceLine
                x={stopYear}
                stroke="#0f172a"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: "Contributions stop", position: "top", fill: "#0f172a", fontSize: 12, dy: 8 }}
              />
              <RechartTooltip
                cursor={{ stroke: "#94a3b8", strokeDasharray: 4 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const record = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-slate-900/90 px-4 py-3 text-sm text-white shadow-lg">
                      <p className="font-semibold">Year {label} · Age {data.startingAge + Number(label)}</p>
                      <p className="text-slate-200">Balance: {formatCurrency(record.balance)}</p>
                      <p className="text-slate-200">Contributions: {formatCurrency(record.totalContributions)}</p>
                      <p className="text-slate-200">Interest: {formatCurrency(record.totalInterest)}</p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="totalContributions"
                stackId="balance"
                stroke="#0ea5e9"
                fill="url(#contributions)"
                strokeWidth={2}
                name="Contributions"
              />
              <Area
                type="monotone"
                dataKey="totalInterest"
                stackId="balance"
                stroke="#d97706"
                fill="url(#growth)"
                strokeWidth={2}
                name="Growth"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="explain-row text-sm leading-relaxed text-slate-600">
          Start {data.startingAge} → Stop {data.contributionEndAge} → Compound to {data.projectionEndAge}.
        </p>
      </div>

      <style jsx>{`
        .chart-shell {
          transition: transform 340ms ease-out;
        }

        .chart-shell.time-axis-pulse {
          transform: translateX(1px);
        }

        .chart-shell :global(.recharts-cartesian-grid line) {
          transition: opacity 340ms ease-out;
        }

        .chart-shell :global(.recharts-cartesian-axis-tick-value) {
          transition: opacity 340ms ease-out;
        }

        .chart-shell.time-axis-pulse :global(.recharts-cartesian-grid line) {
          opacity: 0.9;
        }

        .chart-shell.time-axis-pulse :global(.recharts-cartesian-axis-tick-value) {
          opacity: 0.95;
        }
      `}</style>
    </div>
  );
}
