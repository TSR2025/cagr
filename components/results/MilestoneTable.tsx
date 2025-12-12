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
  currentAge: number;
}

export function MilestoneTable({ data, currentAge }: MilestoneTableProps) {
  return (
    <Card className="border-slate-200 bg-white/90">
      <CardHeader className="px-6 pt-5 pb-0">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">Milestones (every 5 years)</h3>
          <p className="text-sm text-slate-500">Stacked contributions and growth by milestone year</p>
        </div>
      </CardHeader>
      <CardContent className="h-[360px] pt-4 pb-6 px-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.milestones}
            margin={{ top: 8, left: 8, right: 8, bottom: 8 }}
            barCategoryGap="18%"
          >
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              ticks={data.milestones.map((m) => m.year)}
              tickFormatter={(year) => `Age ${currentAge + Number(year)}`}
              tick={{ fill: "#475569", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
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
                    <p className="font-semibold">Year {label} · Age {currentAge + Number(label)}</p>
                    <p className="text-slate-200">Balance: {formatCurrency(record.balance)}</p>
                    <p className="text-slate-200">Contributions: {formatCurrency(record.totalContributions)}</p>
                    <p className="text-slate-200">Interest: {formatCurrency(record.totalInterest)}</p>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: 4 }}
              formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
            />
            <Bar dataKey="totalContributions" name="Contributions" stackId="balance" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="totalInterest" name="Growth" stackId="balance" fill="#f59e0b" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="balance"
                position="top"
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
