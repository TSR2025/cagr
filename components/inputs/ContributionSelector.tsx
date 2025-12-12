"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

const PRIMARY_AMOUNTS = [250, 500, 750, 1000];
const SECONDARY_AMOUNTS = [1250, 1500, 1750, 2000];

interface ContributionSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const EASING = "cubic-bezier(0.2, 0.9, 0.2, 1)";

export function ContributionSelector({ value, onChange }: ContributionSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState(String(value ?? ""));
  const [pressedValue, setPressedValue] = useState<number | null>(null);
  const [rowHeight, setRowHeight] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCustomValue(String(value ?? ""));
  }, [value]);

  useEffect(() => {
    if (rowRef.current) {
      setRowHeight(rowRef.current.scrollHeight);
    }
  }, [rowRef]);

  useEffect(() => {
    if (showCustomInput) {
      const id = requestAnimationFrame(() => customInputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [showCustomInput]);

  const allOptions = useMemo(() => [...PRIMARY_AMOUNTS, ...SECONDARY_AMOUNTS], []);

  const selectAmount = (amount: number) => {
    onChange(amount);
    setCustomValue(String(amount));
  };

  const handleCustomChange = (next: string) => {
    const sanitized = next.replace(/[^\d]/g, "");
    const parsed = Math.max(0, Number(sanitized || 0));
    setCustomValue(sanitized);
    onChange(parsed);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectAmount(allOptions[index]);
    }

    const columns = 4;
    const totalVisible = isExpanded ? allOptions.length : PRIMARY_AMOUNTS.length;

    const moveFocus = (nextIndex: number) => {
      const clampedIndex = ((nextIndex % totalVisible) + totalVisible) % totalVisible;
      const target = document.querySelector<HTMLButtonElement>(`[data-option-index="${clampedIndex}"]`);
      target?.focus();
    };

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        moveFocus(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveFocus(index - 1);
        break;
      case "ArrowDown":
        if (isExpanded) {
          event.preventDefault();
          moveFocus(index + columns);
        }
        break;
      case "ArrowUp":
        if (isExpanded && index - columns >= 0) {
          event.preventDefault();
          moveFocus(index - columns);
        }
        break;
    }
  };

  const renderTile = (amount: number, index: number) => {
    const isSelected = value === amount;
    const isPressed = pressedValue === amount;
    const baseScale = isSelected ? 1.01 : 1;
    const scale = isPressed ? 0.98 : baseScale;

    return (
      <button
        key={amount}
        type="button"
        role="radio"
        aria-checked={isSelected}
        data-option-index={index}
        onPointerDown={() => setPressedValue(amount)}
        onPointerUp={() => setPressedValue(null)}
        onPointerLeave={() => setPressedValue(null)}
        onClick={() => selectAmount(amount)}
        onKeyDown={(event) => handleKeyDown(event, index)}
        className="group relative flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-lg font-semibold text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.06)] outline-none transition-[background-color,border-color,box-shadow] focus-visible:ring-2 focus-visible:ring-primary/30"
        style={{
          transform: `scale(${scale})`,
          transition: `transform ${isPressed ? 80 : 140}ms ${EASING}, background-color 140ms ${EASING}, border-color 140ms ${EASING}, box-shadow 140ms ${EASING}`,
          borderColor: isSelected ? "rgb(59 130 246)" : undefined,
          backgroundColor: isSelected ? "rgba(59, 130, 246, 0.08)" : undefined,
          boxShadow: isSelected
            ? "0 10px 25px -12px rgba(59,130,246,0.35), 0 1px 2px rgba(15,23,42,0.08)"
            : undefined
        }}
      >
        <span className="text-2xl">${amount.toLocaleString()}</span>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-slate-700">Contribution Amount</Label>
      </div>

      <div className="space-y-3" role="radiogroup" aria-label="Monthly contribution amount">
        <div className="grid grid-cols-4 gap-3">
          {PRIMARY_AMOUNTS.map((amount, index) => renderTile(amount, index))}
        </div>

        <div
          className="overflow-hidden"
          style={{
            maxHeight: isExpanded ? rowHeight : 0,
            transition: `max-height ${isExpanded ? 300 : 240}ms ${EASING}`
          }}
          aria-hidden={!isExpanded}
        >
          <div
            ref={rowRef}
            className="mt-3 grid grid-cols-4 gap-3 opacity-0"
            style={{
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded ? "translateY(0)" : "translateY(6px)",
              transition: `opacity 200ms ${EASING} ${isExpanded ? "50ms" : "0ms"}, transform 220ms ${EASING} ${isExpanded ? "50ms" : "0ms"}`,
              pointerEvents: isExpanded ? "auto" : "none"
            }}
          >
            {SECONDARY_AMOUNTS.map((amount, index) => renderTile(amount, PRIMARY_AMOUNTS.length + index))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={isExpanded}
            className="group gap-2 px-3 text-sm font-medium text-slate-700"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            Explore other amounts
            <ChevronDown
              className="h-4 w-4 text-slate-600"
              style={{
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: `transform 200ms ${EASING}`
              }}
            />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-sm font-medium text-slate-700"
            onClick={() => {
              setShowCustomInput((prev) => !prev);
              setCustomValue(String(value ?? ""));
            }}
          >
            Custom amount
          </Button>
        </div>

        <div
          className="overflow-hidden"
          style={{
            maxHeight: showCustomInput ? 100 : 0,
            transition: `max-height 220ms ${EASING}`
          }}
          aria-hidden={!showCustomInput}
        >
          <div
            className="pt-2 opacity-0"
            style={{
              opacity: showCustomInput ? 1 : 0,
              transform: showCustomInput ? "translateY(0)" : "translateY(6px)",
              transition: `opacity 220ms ${EASING}, transform 220ms ${EASING}`
            }}
          >
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">$</span>
              <Input
                ref={customInputRef}
                inputMode="numeric"
                pattern="\\d*"
                type="text"
                value={customValue}
                onChange={(event) => handleCustomChange(event.target.value)}
                className="pl-7"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
