import { ProjectionResult } from "@/lib/calculations/calculateProjection";
import { formatCompactCurrency } from "@/lib/utils/formatCompactCurrency";

const CHECKPOINT_AGES = [55, 65, 75];

interface OptionsStripProps {
  data: ProjectionResult;
}

function getCheckpointRecord(data: ProjectionResult, targetAge: number) {
  return (
    data.yearly.find((record) => record.age === targetAge) ||
    data.yearly.find((record) => record.age > targetAge) ||
    data.yearly[data.yearly.length - 1]
  );
}

export function OptionsStrip({ data }: OptionsStripProps) {
  const checkpoints = CHECKPOINT_AGES.map((age) => {
    const record = getCheckpointRecord(data, age);
    const total = Math.max(record.balance, 1);
    const contributionPortion = Math.min(Math.max(record.totalContributions / total, 0), 1);

    return {
      age,
      balance: record.balance,
      contributionPortion,
      growthPortion: Math.max(0, 1 - contributionPortion)
    };
  });

  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-subtle">
      <p className="text-sm font-semibold text-slate-800">Your options</p>
      <div className="grid grid-cols-3 gap-4 text-center sm:gap-6">
        {checkpoints.map((item) => (
          <div key={item.age} className="space-y-1.5">
            <p className="text-[11px] font-medium text-slate-500">{item.age}</p>
            <p className="text-2xl font-semibold leading-tight text-slate-900">
              {formatCompactCurrency(item.balance)}
            </p>
            <div className="mx-auto flex h-2 w-full max-w-[140px] overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-sky-500"
                style={{ width: `${item.contributionPortion * 100}%` }}
                aria-hidden
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${item.growthPortion * 100}%` }}
                aria-hidden
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">These are checkpoints, not a finish line.</p>
    </div>
  );
}
