"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { TooltipIcon } from "./TooltipIcon";
import clsx from "clsx";

interface ContributionSelectorProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  tooltip?: string;
}

const PRIMARY_AMOUNTS = [250, 500, 750, 1000];
const SECONDARY_AMOUNTS = [1250, 1500, 1750, 2000];
const EASING = "cubic-bezier(0.2, 0.9, 0.2, 1)";

export function ContributionSelector({ value, onChange, label = "Contribution Amount", tooltip }: ContributionSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTile, setActiveTile] = useState<number | null>(null);

  const presetAmounts = useMemo(() => ({ primary: PRIMARY_AMOUNTS, secondary: SECONDARY_AMOUNTS }), []);

  const handleTileSelect = (amount: number) => {
    setActiveTile(null);
    onChange(amount);
  };

  const tileBaseClasses = "flex h-20 items-center justify-center rounded-xl border transition-all duration-150 shadow-subtle bg-slate-50";
  const tileHoverClasses = "hover:border-slate-300 hover:shadow-md";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
        {tooltip && <TooltipIcon text={tooltip} />}
      </div>

      <div className="space-y-3" aria-label="Monthly contribution amount" role="radiogroup">
        <div className="grid grid-cols-4 gap-3">
          {presetAmounts.primary.map((amount) => {
            const isSelected = value === amount;
            const isPressed = activeTile === amount;
            const scale = isPressed ? 0.98 : isSelected ? 1.01 : 1;
            const transitionDuration = isPressed ? "80ms" : "140ms";
            return (
              <button
                key={amount}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={clsx(
                  tileBaseClasses,
                  tileHoverClasses,
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300",
                  isSelected && "border-slate-500 bg-white shadow-md"
                )}
                style={{
                  transform: `scale(${scale})`,
                  transitionTimingFunction: EASING,
                  transitionDuration
                }}
                onPointerDown={() => setActiveTile(amount)}
                onPointerUp={() => setActiveTile(null)}
                onPointerLeave={() => setActiveTile(null)}
                onClick={() => handleTileSelect(amount)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleTileSelect(amount);
                  }
                }}
              >
                <span className="text-lg font-semibold text-slate-800">${amount.toLocaleString()}</span>
              </button>
            );
          })}
        </div>

        <div
          className="overflow-hidden"
          style={{
            maxHeight: isExpanded ? 300 : 0,
            transition: `max-height ${isExpanded ? 300 : 240}ms ${EASING}`
          }}
        >
          <div
            className={clsx(
              "grid grid-cols-4 gap-3 pt-3",
              isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[6px] pointer-events-none"
            )}
            style={{
              transition: `opacity 200ms ${EASING} ${isExpanded ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
                isExpanded ? "50ms" : "0ms"
              }`
            }}
          >
            {presetAmounts.secondary.map((amount) => {
              const isSelected = value === amount;
              const isPressed = activeTile === amount;
              const scale = isPressed ? 0.98 : isSelected ? 1.01 : 1;
              const transitionDuration = isPressed ? "80ms" : "140ms";
              return (
                <button
                  key={amount}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={clsx(
                    tileBaseClasses,
                    tileHoverClasses,
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300",
                    isSelected && "border-slate-500 bg-white shadow-md"
                  )}
                  style={{
                    transform: `scale(${scale})`,
                    transitionTimingFunction: EASING,
                    transitionDuration
                  }}
                  onPointerDown={() => setActiveTile(amount)}
                  onPointerUp={() => setActiveTile(null)}
                  onPointerLeave={() => setActiveTile(null)}
                  onClick={() => handleTileSelect(amount)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleTileSelect(amount);
                    }
                  }}
                >
                  <span className="text-lg font-semibold text-slate-800">${amount.toLocaleString()}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="flex items-center gap-1 text-slate-700"
          >
            <ChevronDown
              className="h-4 w-4 transition-transform"
              style={{
                transform: `rotate(${isExpanded ? 180 : 0}deg)`,
                transitionTimingFunction: EASING,
                transitionDuration: "200ms"
              }}
            />
            Explore other amounts
          </Button>
        </div>
      </div>
    </div>
  );
}
