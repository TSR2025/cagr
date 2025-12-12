import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumericField } from "./NumericField";
import { cn } from "@/lib/utils/styles";
import { TooltipIcon } from "./TooltipIcon";

interface ContributionAmountGridProps {
  value: number;
  onChange: (value: number) => void;
}

const contributionOptions = [250, 500, 750, 1000, 2000, 3000, 4000, 5000];

export function ContributionAmountGrid({ value, onChange }: ContributionAmountGridProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="recurringAmount">Contribution Amount</Label>
        <TooltipIcon text="Pick a preset contribution to see its impact or enter your own." />
      </div>
      <div className="space-y-3" id="recurringAmount">
        <div className="overflow-x-auto">
          <div className="grid grid-flow-col auto-cols-fr gap-2">
            {contributionOptions.map((amount) => {
              const isSelected = value === amount;
              return (
                <Button
                  key={amount}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "h-12 text-base font-semibold",
                    !isSelected && "border-slate-200 text-slate-800"
                  )}
                  aria-pressed={isSelected}
                  onClick={() => onChange(amount)}
                >
                  {`$${amount.toLocaleString()}`}
                </Button>
              );
            })}
          </div>
        </div>
        <NumericField
          id="recurringAmount"
          label="Custom amount"
          prefix="$"
          value={value}
          onChange={(val) => onChange(val)}
        />
      </div>
    </div>
  );
}
