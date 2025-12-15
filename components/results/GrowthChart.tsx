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
import { useEffect, useState } from "react";

interface GrowthChartProps {
  data: ProjectionResult;
  currentAge: number;
  timePulseSignal: number;
}

export function GrowthChart({ data, currentAge, timePulseSignal }: GrowthChartProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (timePulseSignal === 0) return;
    setIsPulsing(true);
    const timeout = window.setTimeout(() => setIsPulsing(false), 360);
    return () => window.clearTimeout(timeout);
  }, [timePulseSignal]);

  return (
    <div className={clsx("chart-shell w-full rounded-2xl border border-slate-200 bg-white/90 p-6 pb-8", isPulsing && "time-axis-pulse")}>
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
              ticks={[0, 5, 10, 15, 20, 25, 30]}
              tickFormatter={(year) => `Age ${currentAge + Number(year)}`}
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
                    <p className="font-semibold">Year {label} · Age {currentAge + Number(label)}</p>
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
