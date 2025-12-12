"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartTooltip,
  XAxis,
  YAxis
} from "recharts";
import { ProjectionResult } from "@/lib/calculations/calculateProjection";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatCompactCurrency } from "@/lib/utils/formatCompactCurrency";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface MilestoneTableProps {
  data: ProjectionResult;
}

export function MilestoneTable({ data }: MilestoneTableProps) {
  return (
    <Card className="border-slate-200 bg-white/90">
      <CardHeader className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Milestones (Every 5 Years)</h3>
            <p className="text-sm text-slate-500">Stacked contributions and growth by milestone year</p>
          </div>
          <div className="hidden items-center gap-3 text-xs font-medium text-slate-600 sm:flex">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden />
              <span>Contributions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden />
              <span>Growth</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[360px] pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.milestones} margin={{ left: 8, right: 8, bottom: 8 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(value) => formatCompactCurrency(value)}
              tick={{ fill: "#475569", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <RechartTooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const record = payload[0].payload;
                return (
                  <div className="rounded-lg bg-slate-900/90 px-4 py-3 text-sm text-white shadow-lg">
                    <p className="font-semibold">Year {label}</p>
                    <p className="text-slate-200">Balance: {formatCurrency(record.balance)}</p>
                    <p className="text-slate-200">Contributions: {formatCurrency(record.totalContributions)}</p>
                    <p className="text-slate-200">Interest: {formatCurrency(record.totalInterest)}</p>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingRight: 12, paddingTop: 4 }}
              formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
            />
            <Bar dataKey="totalContributions" name="Contributions" stackId="balance" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="totalContributions"
                position="insideTop"
                formatter={(value: number) => formatCompactCurrency(value)}
                fill="#0f172a"
                fontSize={12}
              />
            </Bar>
            <Bar dataKey="totalInterest" name="Growth" stackId="balance" fill="#f59e0b" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="totalInterest"
                position="insideTop"
                formatter={(value: number) => formatCompactCurrency(value)}
                fill="#0f172a"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
