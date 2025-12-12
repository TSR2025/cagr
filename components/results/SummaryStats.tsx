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
  const operators = ["+", "="];

  return (
    <Card className="border-slate-200 bg-white/90">
      <div className="grid items-center gap-4 px-4 py-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {items.map((item, index) => (
          <div key={item.label} className="space-y-1">
            <p className="text-sm text-slate-600">{item.label}</p>
            <p className="text-xl font-semibold text-slate-900">{formatCurrency(item.value)}</p>
            {index < operators.length && (
              <span className="mt-1 inline-block text-lg font-semibold text-slate-400 sm:hidden">
                {operators[index]}
              </span>
            )}
          </div>
        ))}

        {operators.map((operator) => (
          <div
            key={operator}
            aria-hidden
            className="hidden items-center justify-center text-lg font-semibold text-slate-400 sm:flex"
          >
            {operator}
          </div>
        ))}
      </div>
    </Card>
  );
}
