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
    <Card className="border-slate-200 bg-white/90">
      <div className="grid gap-4 px-4 py-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <p className="text-sm text-slate-600">{item.label}</p>
            <p className="text-xl font-semibold text-slate-900">{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
