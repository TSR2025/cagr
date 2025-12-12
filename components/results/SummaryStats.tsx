import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { ProjectionResult } from "@/lib/calculations/calculateProjection";

interface SummaryStatsProps {
  data: ProjectionResult;
}

export function SummaryStats({ data }: SummaryStatsProps) {
  const items = [
    { label: "Total Contributions", value: data.totalContributions },
    { label: "Total Interest", value: data.totalInterest },
    { label: "Final Balance", value: data.finalBalance }
  ];

  return (
    <Card className="border-slate-200 bg-white/90 print-avoid-break">
      <div className="grid gap-4 px-4 py-3 sm:grid-cols-3">
    <Card className="border-slate-200 bg-white/90">
      <div className="grid divide-y divide-slate-100 px-6 py-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5 px-1 sm:px-4">
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p className="text-2xl font-semibold leading-tight text-slate-900">{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
