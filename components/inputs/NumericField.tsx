import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TooltipIcon } from "./TooltipIcon";

interface NumericFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  prefix?: string;
  tooltip?: string;
}

export function NumericField({ id, label, value, onChange, min = 0, step = 1, prefix, tooltip }: NumericFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>{label}</Label>
        {tooltip && <TooltipIcon text={tooltip} />}
      </div>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-2.5 text-slate-500 text-sm">{prefix}</span>}
        <Input
          id={id}
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={prefix ? "pl-7" : undefined}
        />
      </div>
    </div>
  );
}
