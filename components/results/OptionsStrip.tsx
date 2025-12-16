import { ProjectionResult } from "@/lib/calculations/calculateProjection";
import { formatCompactCurrency } from "@/lib/utils/formatCompactCurrency";

const CHECKPOINT_AGES = [55, 65, 75];

interface Checkpoint {
  age: number;
  balance: number;
  contributions: number;
  growth: number;
}

function findCheckpoint(data: ProjectionResult, age: number): Checkpoint {
  const exact = data.yearly.find((record) => record.age === age);
  if (exact) {
    return {
      age,
      balance: exact.balance,
      contributions: exact.totalContributions,
      growth: exact.totalInterest
    };
  }

  const next = data.yearly.find((record) => record.age > age) ?? data.yearly[data.yearly.length - 1];

  return {
    age,
    balance: next.balance,
    contributions: next.totalContributions,
    growth: next.totalInterest
  };
}

interface OptionsStripProps {
  data: ProjectionResult;
}

export function OptionsStrip({ data }: OptionsStripProps) {
  const checkpoints = CHECKPOINT_AGES.map((age) => findCheckpoint(data, age));

  return (
    <div className="space-y-2.5">
      <p className="text-sm font-semibold text-slate-700">Your options</p>

      <div className="grid grid-cols-3 gap-2 text-center text-[13px] font-medium text-slate-500">
        {checkpoints.map((checkpoint) => (
          <p key={`label-${checkpoint.age}`}>{checkpoint.age}</p>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {checkpoints.map((checkpoint) => (
          <p key={`balance-${checkpoint.age}`} className="text-2xl font-semibold text-slate-900">
            {formatCompactCurrency(checkpoint.balance)}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {checkpoints.map((checkpoint) => {
          const total = Math.max(checkpoint.balance, 0.0001);
          const contributionShare = Math.max(0, checkpoint.contributions) / total;
          const growthShare = Math.max(0, checkpoint.growth) / total;

          return (
            <div key={`bar-${checkpoint.age}`} className="flex justify-center">
              <div className="flex h-2 w-full max-w-[140px] overflow-hidden rounded-full bg-slate-200">
                <span
                  className="h-full bg-sky-400"
                  style={{ width: `${contributionShare * 100}%` }}
                  aria-hidden
                />
                <span
                  className="h-full bg-amber-400"
                  style={{ width: `${growthShare * 100}%` }}
                  aria-hidden
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[12px] text-slate-500">These are checkpoints, not a finish line.</p>
    </div>
  );
}
