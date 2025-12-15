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
import { useEffect, useMemo, useRef, useState } from "react";
import {
  clampContributionEndAge,
  clampStartingAge,
  SNAP_INCREMENT_YEARS
} from "@/lib/utils/timeModel";

interface GrowthChartProps {
  data: ProjectionResult;
  startingAge: number;
  contributionEndAge: number;
  projectionEndAge: number;
  onStartingAgeChange: (value: number) => void;
  onContributionEndAgeChange: (value: number) => void;
  timePulseSignal: number;
}

export function GrowthChart({
  data,
  startingAge,
  contributionEndAge,
  projectionEndAge,
  onStartingAgeChange,
  onContributionEndAgeChange,
  timePulseSignal
}: GrowthChartProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const [ageInput, setAgeInput] = useState(startingAge.toString());

  useEffect(() => {
    setAgeInput(startingAge.toString());
  }, [startingAge]);

  useEffect(() => {
    if (timePulseSignal === 0) return;
    setIsPulsing(true);
    const timeout = window.setTimeout(() => setIsPulsing(false), 360);
    return () => window.clearTimeout(timeout);
  }, [timePulseSignal]);

  const ticks = useMemo(() => {
    const labels: number[] = [];
    for (let age = startingAge; age <= projectionEndAge; age += SNAP_INCREMENT_YEARS) {
      labels.push(age);
    }
    if (labels[labels.length - 1] !== projectionEndAge) {
      labels.push(projectionEndAge);
    }
    return labels;
  }, [projectionEndAge, startingAge]);

  const yearTicks = ticks.map((age) => age - startingAge);

  const handleAgeCommit = () => {
    const parsed = Number(ageInput);
    const next = clampStartingAge(Number.isFinite(parsed) ? parsed : startingAge);
    onStartingAgeChange(next);
  };

  const handleContributionChange = (age: number) => {
    const next = clampContributionEndAge(startingAge, age);
    onContributionEndAgeChange(next);
  };

  const copy = `Starting at ${startingAge}, you contribute until ${contributionEndAge}, then let it grow.`;

  return (
    <div className={clsx("chart-shell w-full rounded-2xl border border-slate-200 bg-white/90 p-6 pb-8", isPulsing && "time-axis-pulse")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-slate-900">Balance over time</h3>
          <p className="text-sm text-slate-500">Contributions vs Growth</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 shadow-sm">
          <button
            type="button"
            aria-label="Decrease starting age"
            className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-lg font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={() => onStartingAgeChange(clampStartingAge(startingAge - 1))}
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            className="w-16 rounded-md border border-transparent bg-transparent text-center text-sm font-semibold text-slate-900 outline-none ring-0 focus:border-slate-300 focus:bg-white"
            value={ageInput}
            onChange={(event) => setAgeInput(event.target.value)}
            onBlur={handleAgeCommit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAgeCommit();
              }
            }}
          />
          <span className="text-xs font-medium text-slate-600">Starting age</span>
          <button
            type="button"
            aria-label="Increase starting age"
            className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-lg font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={() => onStartingAgeChange(clampStartingAge(startingAge + 1))}
          >
            +
          </button>
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
              ticks={yearTicks}
              domain={[0, data.totalYears]}
              tickFormatter={(year) => {
                const age = startingAge + Number(year);
                const isEnd = age === projectionEndAge;
                return `Age ${age}${isEnd ? "+" : ""}`;
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
                    <p className="font-semibold">Year {label} · Age {startingAge + Number(label)}</p>
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

      <ContributionRail
        ticks={ticks}
        startingAge={startingAge}
        contributionEndAge={contributionEndAge}
        projectionEndAge={projectionEndAge}
        onContributionEndAgeChange={handleContributionChange}
      />

      <p className="mt-3 text-sm text-slate-600">{copy}</p>

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

interface ContributionRailProps {
  ticks: number[];
  startingAge: number;
  contributionEndAge: number;
  projectionEndAge: number;
  onContributionEndAgeChange: (age: number) => void;
}

function ContributionRail({
  ticks,
  startingAge,
  contributionEndAge,
  projectionEndAge,
  onContributionEndAgeChange
}: ContributionRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!railRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      setWidth(entry.contentRect.width);
    });
    observer.observe(railRef.current);
    return () => observer.disconnect();
  }, []);

  const ratioForAge = (age: number) => {
    const span = projectionEndAge - startingAge;
    if (span <= 0) return 0;
    return Math.max(0, Math.min((age - startingAge) / span, 1));
  };

  const handlePointer = (clientX: number) => {
    if (!railRef.current || width === 0) return;
    const rect = railRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min((clientX - rect.left) / width, 1));
    const rawAge = startingAge + ratio * (projectionEndAge - startingAge);
    onContributionEndAgeChange(rawAge);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    handlePointer(event.clientX);

    const move = (e: PointerEvent) => handlePointer(e.clientX);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const contributionRatio = ratioForAge(contributionEndAge);

  return (
    <div className="mt-6 space-y-3">
      <div className="relative" ref={railRef} onPointerDown={handlePointerDown}>
        <div className="h-1.5 rounded-full bg-slate-100" />
        <div
          role="slider"
          aria-label="Contribution end age"
          aria-valuemin={ticks[0]}
          aria-valuemax={projectionEndAge}
          aria-valuenow={contributionEndAge}
          className="pointer-events-auto absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 cursor-grab rounded-full border border-slate-300 bg-white shadow-sm transition hover:bg-slate-50 active:cursor-grabbing"
          style={{ left: `${contributionRatio * 100}%`, transform: "translate(-50%, -50%)" }}
        >
          <div className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs font-semibold text-white shadow">
            Contributions end
          </div>
          <div className="pointer-events-none absolute inset-[-8px]" />
        </div>
        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate-400">▶</div>
        <div className="absolute inset-0 flex items-center justify-between px-[2px]">
          {ticks.map((age) => (
            <span key={age} className="text-[11px] font-semibold text-slate-500">
              {age === projectionEndAge ? `${age}+` : age}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Starting age</span>
        <span>Projection extends</span>
      </div>
    </div>
  );
}
