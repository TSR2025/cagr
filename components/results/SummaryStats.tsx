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

  const layout = items.reduce<(JSX.Element | string)[]>((acc, item, index) => {
    acc.push(
      <div key={item.label} className="space-y-1">
        <p className="text-sm text-slate-600">{item.label}</p>
        <p className="text-xl font-semibold text-slate-900">{formatCurrency(item.value)}</p>
        {index < operators.length && (
          <span className="mt-1 inline-block text-2xl font-semibold text-slate-400 sm:hidden">
            {operators[index]}
          </span>
        )}
      </div>
    );

    if (index < operators.length) {
      acc.push(operators[index]);
    }

    return acc;
  }, []);

  return (
    <Card className="border-slate-200 bg-white/90">
      <div className="grid items-center gap-4 px-4 py-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {layout.map((item, index) =>
          typeof item === "string" ? (
            <div
              key={`${item}-${index}`}
              aria-hidden
              className="hidden items-center justify-center text-2xl font-semibold text-slate-400 sm:flex"
            >
              {item}
            </div>
          ) : (
            item
          )
        )}
      </div>
    </Card>
  );
}
