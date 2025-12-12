"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/styles";

const primaryOptions = [250, 500, 750, 1000];
const secondaryOptions = [1250, 1500, 1750, 2000];
const easing = "cubic-bezier(0.2, 0.9, 0.2, 1)";

interface ContributionSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function ContributionSelector({ value, onChange }: ContributionSelectorProps) {
  const [showMore, setShowMore] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [pressed, setPressed] = useState<number | null>(null);
  const [customValue, setCustomValue] = useState(() => value.toString());
  const [maxHeight, setMaxHeight] = useState(0);
  const [heightDuration, setHeightDuration] = useState(300);
  const secondaryRowRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (secondaryRowRef.current) {
      setMaxHeight(secondaryRowRef.current.scrollHeight);
    }
  }, []);

  useEffect(() => {
    if (showCustomInput) {
      setCustomValue(value.toString());
      customInputRef.current?.focus();
    }
  }, [showCustomInput, value]);

  const toggleShowMore = () => {
    const next = !showMore;
    setHeightDuration(next ? 300 : 240);
    setShowMore(next);
  };

  const handleTileSelect = (amount: number) => {
    setShowCustomInput(false);
    onChange(amount);
    setCustomValue(amount.toString());
  };

  const handleCustomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "");
    const nextValue = digits === "" ? 0 : Number(digits);
    setCustomValue(digits);
    onChange(Math.max(0, nextValue));
  };

  const selectedLabel = useMemo(() => `$${value.toLocaleString()}`, [value]);

  return (
    <div className="space-y-3" aria-label="Monthly contribution amount">
      <div className="grid grid-cols-4 gap-3" role="radiogroup" aria-label="Contribution options">
        {primaryOptions.map((amount) => (
          <TileButton
            key={amount}
            amount={amount}
            isSelected={value === amount}
            pressed={pressed === amount}
            onPointerDown={() => setPressed(amount)}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            onSelect={() => handleTileSelect(amount)}
          />
        ))}
      </div>

      <div
        className="overflow-hidden"
        style={{
          maxHeight: showMore ? maxHeight : 0,
          transition: `max-height ${heightDuration}ms ${easing}`
        }}
        aria-hidden={!showMore}
      >
        <div
          ref={secondaryRowRef}
          className="grid grid-cols-4 gap-3 pt-3"
          style={{
            opacity: showMore ? 1 : 0,
            transform: showMore ? "translateY(0)" : "translateY(6px)",
            transitionProperty: "opacity, transform",
            transitionTimingFunction: easing,
            transitionDuration: "200ms, 220ms",
            transitionDelay: showMore ? "50ms, 50ms" : "0ms, 0ms"
          }}
        >
          {secondaryOptions.map((amount) => (
            <TileButton
              key={amount}
              amount={amount}
              isSelected={value === amount}
              pressed={pressed === amount}
              onPointerDown={() => setPressed(amount)}
              onPointerUp={() => setPressed(null)}
              onPointerLeave={() => setPressed(null)}
              onSelect={() => handleTileSelect(amount)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button
          type="button"
          variant="ghost"
          className="px-0 text-slate-700 hover:text-slate-900"
          aria-expanded={showMore}
          onClick={toggleShowMore}
        >
          Explore other amounts
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowCustomInput((prev) => !prev)}
        >
          Custom amount
        </Button>
        <span className="text-sm text-slate-500">Selected: {selectedLabel}</span>
      </div>

      <div
        className="overflow-hidden"
        style={{
          maxHeight: showCustomInput ? 100 : 0,
          transition: `max-height 220ms ${easing}`
        }}
        aria-hidden={!showCustomInput}
      >
        <div
          className="pt-2"
          style={{
            opacity: showCustomInput ? 1 : 0,
            transform: showCustomInput ? "translateY(0)" : "translateY(6px)",
            transitionProperty: "opacity, transform",
            transitionTimingFunction: easing,
            transitionDuration: "220ms, 220ms"
          }}
        >
          <label htmlFor="customAmount" className="sr-only">
            Custom monthly contribution
          </label>
          <div className="relative max-w-sm">
            <span className="absolute left-3 top-2.5 text-slate-500">$</span>
            <Input
              ref={customInputRef}
              id="customAmount"
              inputMode="numeric"
              value={customValue}
              onChange={handleCustomChange}
              className="pl-7"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface TileButtonProps {
  amount: number;
  isSelected: boolean;
  pressed: boolean;
  onSelect: () => void;
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
}

function TileButton({
  amount,
  isSelected,
  pressed,
  onSelect,
  onPointerDown,
  onPointerUp,
  onPointerLeave
}: TileButtonProps) {
  const scale = pressed ? 0.98 : isSelected ? 1.01 : 1;
  const transitionDuration = pressed ? 80 : 140;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      className={cn(
        "w-full rounded-xl border bg-slate-50/80 px-4 py-5 text-center text-lg font-semibold text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors",
        "hover:border-slate-300 hover:shadow-[0_10px_25px_-15px_rgba(15,23,42,0.35)]",
        isSelected
          ? "border-slate-400 bg-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.45)]"
          : "border-slate-200"
      )}
      style={{
        transform: `scale(${scale})`,
        transitionTimingFunction: easing,
        transitionDuration: `${transitionDuration}ms`,
        transitionProperty: "transform, box-shadow, background-color, border-color"
      }}
    >
      ${amount.toLocaleString()}
    </button>
  );
}
