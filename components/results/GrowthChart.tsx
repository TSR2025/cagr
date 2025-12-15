"use client";

import {
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis,
  AreaChart
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

  const ticks = useMemo(() => {
    const ages: number[] = [];
    for (let age = data.startingAge; age <= data.projectionEndAge; age += SNAP_INCREMENT_YEARS) {
      ages.push(age);
    }
    if (ages[ages.length - 1] !== data.projectionEndAge) {
      ages.push(data.projectionEndAge);
    }
    return ages;
  }, [data.projectionEndAge, data.startingAge]);

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

  const totalSpan = Math.max(data.projectionEndAge - data.startingAge, 1);

  const ageToPercent = (age: number) => ((age - data.startingAge) / totalSpan) * 100;

  return (
    <div className={clsx("chart-shell w-full rounded-2xl border border-slate-200 bg-white/90 p-6 pb-8", isPulsing && "time-axis-pulse")}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-slate-900">Balance over time</h3>
            <p className="text-sm text-slate-500">Contributions vs Growth</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
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

        <TimeControls
          startingAge={data.startingAge}
          onStartingAgeChange={onStartingAgeChange}
          stopContributingAge={data.contributionEndAge}
          onStopContributingAgeChange={onContributionEndAgeChange}
          minAge={MIN_AGE}
          maxAge={data.projectionEndAge}
          minWindowYears={MIN_CONTRIB_WINDOW_YEARS}
          snapIncrementYears={SNAP_INCREMENT_YEARS}
          className="w-full sm:w-auto"
        />
      </div>
      <div className="mt-4 space-y-3">
        <div className="plot-area h-[300px] w-full overflow-hidden pb-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.yearly} margin={{ left: 8, right: 8, bottom: 24 }}>
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

        <div className="rail-area relative mt-3">
          <div className="h-[10px] rounded-full bg-slate-100" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-end pr-1 text-slate-400">
            <span className="text-sm">▶</span>
          </div>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
            {ticks.map((age) => {
              const percent = ageToPercent(age);
              const isLast = age === ticks[ticks.length - 1];
              return (
                <div key={age} className="absolute" style={{ left: `${percent}%`, transform: "translateX(-50%)" }}>
                  <div className="h-3 w-[2px] rounded-full bg-slate-400/70" aria-hidden />
                  <div className="pt-2 text-[11px] font-medium text-slate-600">{isLast ? `${age}+` : age}</div>
                </div>
              );
            })}
          </div>

          <div
            className="absolute top-1/2 flex -translate-y-1/2 -translate-x-1/2 flex-col items-center gap-1"
            style={{ left: `${ageToPercent(data.contributionEndAge)}%` }}
            aria-label={`Contributions end at age ${data.contributionEndAge}`}
          >
            <div className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white shadow-subtle">
              Contributions end
            </div>
            <div className="relative h-4 w-4">
              <div className="absolute inset-0 rounded-full border-2 border-slate-900 bg-white shadow-md" />
            </div>
          </div>
        </div>

        <p className="explain-row mt-3 text-sm leading-relaxed text-slate-600">
          Starting at {data.startingAge}, you contribute until {data.contributionEndAge}, then let it grow.
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
