import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/styles";
import { OneTimeBoost } from "@/lib/calculations/calculateProjection";

interface OneTimeBoostRowProps {
  boost: OneTimeBoost;
  onChange: (boost: OneTimeBoost) => void;
  onRemove: () => void;
  isRemovable: boolean;
  maxYear: number;
}

export function OneTimeBoostRow({ boost, onChange, onRemove, isRemovable, maxYear }: OneTimeBoostRowProps) {
  const handleChange = (field: keyof OneTimeBoost, value: string) => {
    const numericFields: (keyof OneTimeBoost)[] = ["year", "amount"];
    const parsedValue = numericFields.includes(field) ? Number(value) : value;
    onChange({ ...boost, [field]: parsedValue });
  };

  return (
    <div className="grid grid-cols-[90px_1fr_160px_40px] items-center gap-3">
      <Input
        type="number"
        min={1}
        max={maxYear}
        placeholder="Year"
        value={boost.year ?? ""}
        onChange={(e) => handleChange("year", e.target.value)}
      />
      <Input
        type="number"
        min={0}
        placeholder="Amount"
        value={boost.amount ?? ""}
        onChange={(e) => handleChange("amount", e.target.value)}
        className="col-span-1"
      />
      <Input
        type="text"
        placeholder="optional description"
        value={boost.label ?? ""}
        onChange={(e) => handleChange("label", e.target.value)}
        className="text-sm text-slate-700"
      />
      <button
        type="button"
        onClick={onRemove}
        className={cn(
          "h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition",
          !isRemovable && "opacity-0 pointer-events-none"
        )}
        aria-label="Remove boost"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
