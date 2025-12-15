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
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  clampContributionEndAge,
  clampStartingAge,
  deriveTimeState,
  MIN_CONTRIB_WINDOW_YEARS,
  SNAP_INCREMENT_YEARS
} from "@/lib/utils/timeModel";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface GrowthChartProps {
  data: ProjectionResult;
  timePulseSignal: number;
  onStartingAgeChange: (age: number) => void;
  onContributionEndAgeChange: (age: number) => void;
  time: ReturnType<typeof deriveTimeState>;
}

export function GrowthChart({ data, timePulseSignal, onStartingAgeChange, onContributionEndAgeChange, time }: GrowthChartProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startingAgeDraft, setStartingAgeDraft] = useState<string>(time.startingAge.toString());

  useEffect(() => {
    if (timePulseSignal === 0) return;
    setIsPulsing(true);
    const timeout = window.setTimeout(() => setIsPulsing(false), 360);
    return () => window.clearTimeout(timeout);
  }, [timePulseSignal]);

  useEffect(() => {
    setStartingAgeDraft(time.startingAge.toString());
  }, [time.startingAge]);

  useEffect(() => {
    const handlePointerUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("pointerup", handlePointerUp);
    }
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [isDragging]);

  const ticks = useMemo(() => {
    const ages = [] as number[];
    for (let age = time.startingAge; age <= time.projectionEndAge; age += SNAP_INCREMENT_YEARS) {
      ages.push(age);
    }
    if (ages[ages.length - 1] !== time.projectionEndAge) {
      ages.push(time.projectionEndAge);
    }
    return ages.map((age) => age - time.startingAge);
  }, [time.projectionEndAge, time.startingAge]);

  const ageLabels = useMemo(() => {
    const ages = [] as number[];
    for (let age = time.startingAge; age <= time.projectionEndAge; age += SNAP_INCREMENT_YEARS) {
      ages.push(age);
    }
    if (ages[ages.length - 1] !== time.projectionEndAge) {
      ages.push(time.projectionEndAge);
    }
    return ages;
  }, [time.projectionEndAge, time.startingAge]);

  const handleRailPointer = (clientX: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const clampedRatio = Math.min(Math.max(ratio, 0), 1);
    const age = time.startingAge + clampedRatio * time.totalYears;
    const nextAge = clampContributionEndAge(time.startingAge, age);
    onContributionEndAgeChange(nextAge);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    handleRailPointer(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging) return;
    handleRailPointer(event.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [isDragging]);

  const handleStartingAgeCommit = () => {
    const numeric = Number(startingAgeDraft);
    const fallback = time.startingAge;
    const next = Number.isFinite(numeric) ? clampStartingAge(numeric) : fallback;
    setStartingAgeDraft(next.toString());
    onStartingAgeChange(next);
  };

  const handleStartingAgeStep = (delta: number) => {
    const next = clampStartingAge(time.startingAge + delta);
    setStartingAgeDraft(next.toString());
    onStartingAgeChange(next);
  };

  const handlePercent = time.totalYears
    ? ((time.contributionEndAge - time.startingAge) / time.totalYears) * 100
    : 0;

  return (
    <div className={clsx("chart-shell w-full rounded-2xl border border-slate-200 bg-white/90 p-6 pb-8", isPulsing && "time-axis-pulse")}>
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold text-slate-900">Balance over time</h3>
            <p className="text-sm text-slate-500">Contributions vs Growth</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Decrease starting age"
              onClick={() => handleStartingAgeStep(-1)}
            >
              −
            </Button>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
              <label htmlFor="starting-age" className="text-xs font-medium text-slate-600">
                Starting age
              </label>
              <Input
                id="starting-age"
                className="h-9 w-20 text-center"
                type="number"
                inputMode="numeric"
                value={startingAgeDraft}
                onChange={(event) => setStartingAgeDraft(event.target.value)}
                onBlur={handleStartingAgeCommit}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleStartingAgeCommit();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Increase starting age"
              onClick={() => handleStartingAgeStep(1)}
            >
              +
            </Button>
          </div>
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
      <div className="mt-4 h-[300px] w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.yearly} margin={{ left: 8, right: 8 }}>
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
              ticks={ticks}
              tickFormatter={(year) => {
                const age = time.startingAge + Number(year);
                const isLastTick = age === time.projectionEndAge;
                return `${age}${isLastTick ? "+" : ""}`;
              }}
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
                    <p className="font-semibold">Year {label} · Age {time.startingAge + Number(label)}</p>
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

      <div className="mt-6 space-y-2">
        <div className="relative">
          <div
            ref={railRef}
            className="relative h-2 w-full cursor-pointer rounded-full bg-slate-100"
            onPointerDown={handlePointerDown}
          >
            {ageLabels.map((age) => {
              const percent = time.totalYears ? ((age - time.startingAge) / time.totalYears) * 100 : 0;
              const isLast = age === time.projectionEndAge;
              return (
                <div
                  key={age}
                  className="pointer-events-none absolute -top-5 -translate-x-1/2 text-[11px] font-medium text-slate-500"
                  style={{ left: `${percent}%` }}
                >
                  {`${age}${isLast ? "+" : ""}`}
                </div>
              );
            })}
            <div
              className="absolute -top-2 h-6 w-6 -translate-x-1/2 cursor-grab active:cursor-grabbing"
              style={{ left: `${handlePercent}%` }}
              onPointerDown={handlePointerDown}
              aria-label="Adjust contribution end age"
              role="slider"
              aria-valuemin={time.startingAge + MIN_CONTRIB_WINDOW_YEARS}
              aria-valuemax={time.projectionEndAge}
              aria-valuenow={time.contributionEndAge}
            >
              <div className="relative h-6 w-6 rounded-full border-2 border-slate-900 bg-white shadow-lg">
                <div className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-slate-800">
                  Contributions end
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute right-0 top-4 text-xs text-slate-400">▶</div>
          </div>
        </div>
        <p className="text-xs text-slate-600">
          Starting at {time.startingAge}, you contribute until {time.contributionEndAge}, then let it grow.
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
