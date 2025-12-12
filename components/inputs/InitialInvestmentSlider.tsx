"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

const PRESET_STOPS = [0, 1000, 5000, 10000, 25000, 50000, 100000, 250000, 1000000];
const EASING = "cubic-bezier(0.2, 0.9, 0.2, 1)";

interface InitialInvestmentSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const findNearestIndex = (value: number) => {
  let nearestIndex = 0;
  let smallestDiff = Number.POSITIVE_INFINITY;

  PRESET_STOPS.forEach((stop, index) => {
    const diff = Math.abs(stop - value);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      nearestIndex = index;
    }
  });

  return nearestIndex;
};

export function InitialInvestmentSlider({ value, onChange }: InitialInvestmentSliderProps) {
  const [sliderIndex, setSliderIndex] = useState(() => findNearestIndex(value));
  const [customValue, setCustomValue] = useState<number>(value);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [valueRenderKey, setValueRenderKey] = useState(0);

  useEffect(() => {
    const nearestIndex = findNearestIndex(value);
    setSliderIndex(nearestIndex);
    setCustomValue(value);
    setValueRenderKey((prev) => prev + 1);
  }, [value]);

  const selectedIndex = useMemo(() => clamp(Math.round(sliderIndex), 0, PRESET_STOPS.length - 1), [sliderIndex]);
  const selectedAmount = PRESET_STOPS[selectedIndex];
  const fillPercent = useMemo(() => (selectedIndex / (PRESET_STOPS.length - 1)) * 100, [selectedIndex]);

  const handleSliderChange = (nextIndex: number) => {
    const clampedIndex = clamp(Math.round(nextIndex), 0, PRESET_STOPS.length - 1);
    const nextValue = PRESET_STOPS[clampedIndex];

    setSliderIndex(clampedIndex);
    setCustomValue(nextValue);

    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const handleCustomBlur = () => {
    const sanitized = Math.max(0, Number(customValue) || 0);
    const nearestIndex = findNearestIndex(sanitized);
    const snappedValue = PRESET_STOPS[nearestIndex];

    setSliderIndex(nearestIndex);
    setCustomValue(snappedValue);

    if (snappedValue !== value) {
      onChange(snappedValue);
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-subtle">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">Initial investment</p>
          <p className="text-xs text-slate-600">Pick a starting amount to seed your plan.</p>
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-slate-600 underline-offset-4 hover:text-slate-800 hover:underline"
          onClick={() => setShowCustomInput((prev) => !prev)}
        >
          {showCustomInput ? "Hide custom" : "Custom"}
        </button>
      </div>

      <div className="space-y-2">
        <div className="relative h-11">
          <div
            key={valueRenderKey}
            className={clsx(
              "absolute inset-0 flex items-center text-3xl font-semibold text-slate-900", 
              "animate-value-change"
            )}
            style={{ animationTimingFunction: EASING }}
            aria-live="polite"
          >
            {formatCurrency(selectedAmount)}
          </div>
        </div>

        <div className="pt-2">
          <div className="relative px-[6px]">
            <input
              type="range"
              min={0}
              max={PRESET_STOPS.length - 1}
              step={1}
              value={sliderIndex}
              onChange={(event) => handleSliderChange(Number(event.target.value))}
              aria-label="Initial investment slider"
              className="initial-investment-slider"
              style={{
                // @ts-expect-error CSS custom property
                "--slider-fill": `${fillPercent}%`,
                // @ts-expect-error CSS custom property
                "--slider-ease": EASING
              }}
            />

            <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-[2px]">
              {PRESET_STOPS.map((stop, index) => (
                <span
                  key={stop}
                  className={clsx(
                    "h-2 w-[2px] rounded-full bg-slate-300",
                    index === selectedIndex && "h-3 bg-slate-500"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="mt-1 flex justify-between text-[11px] font-medium text-slate-500">
            <span>{formatCurrency(PRESET_STOPS[0])}</span>
            <span>{formatCurrency(PRESET_STOPS[PRESET_STOPS.length - 1])}</span>
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden"
        style={{
          maxHeight: showCustomInput ? 120 : 0,
          transition: `max-height ${showCustomInput ? 260 : 220}ms ${EASING}`
        }}
      >
        <div
          className={clsx(
            "rounded-xl border border-slate-200 bg-slate-50/70 p-3",
            showCustomInput ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-[6px] opacity-0"
          )}
          style={{
            transition: `opacity 200ms ${EASING} ${showCustomInput ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
              showCustomInput ? "50ms" : "0ms"
            }`
          }}
        >
          <label className="text-xs font-medium text-slate-700" htmlFor="customInitialInput">
            Custom amount (snaps to nearest preset)
          </label>
          <div className="mt-2 flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-inner">
            <span className="text-sm text-slate-500">$</span>
            <input
              id="customInitialInput"
              type="number"
              min={0}
              value={customValue}
              onChange={(event) => setCustomValue(Number(event.target.value))}
              onBlur={handleCustomBlur}
              className="ml-2 w-full appearance-none bg-transparent text-sm font-semibold text-slate-800 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
