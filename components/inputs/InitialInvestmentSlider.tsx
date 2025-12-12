"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import clsx from "clsx";

const EASING = "cubic-bezier(0.2, 0.9, 0.2, 1)";

const PRESET_AMOUNTS = [0, 1000, 5000, 10000, 25000, 50000, 100000, 250000, 1000000] as const;

interface InitialInvestmentSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
};

const findNearestStopIndex = (value: number) => {
  let closestIndex = 0;
  let smallestDiff = Infinity;

  PRESET_AMOUNTS.forEach((stop, index) => {
    const diff = Math.abs(stop - value);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestIndex = index;
    }
  });

  return closestIndex;
};

export function InitialInvestmentSlider({ value, onChange }: InitialInvestmentSliderProps) {
  const [sliderIndex, setSliderIndex] = useState(() => findNearestStopIndex(value));
  const [displayValue, setDisplayValue] = useState(PRESET_AMOUNTS[sliderIndex]);
  const [isFading, setIsFading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState(String(value));
  const hasSyncedInitialValue = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const progress = useMemo(() => (sliderIndex / (PRESET_AMOUNTS.length - 1)) * 100, [sliderIndex]);

  useEffect(() => {
    const nearestIndex = findNearestStopIndex(value);
    setSliderIndex(nearestIndex);
    setIsFading(true);

    const timeout = setTimeout(() => {
      setDisplayValue(PRESET_AMOUNTS[nearestIndex]);
      requestAnimationFrame(() => setIsFading(false));
    }, 90);

    if (!hasSyncedInitialValue.current && PRESET_AMOUNTS[nearestIndex] !== value) {
      onChange(PRESET_AMOUNTS[nearestIndex]);
    }

    hasSyncedInitialValue.current = true;
    setCustomValue(String(value));

    return () => clearTimeout(timeout);
  }, [value, onChange]);

  const updateFromIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(PRESET_AMOUNTS.length - 1, index));
    const nearestValue = PRESET_AMOUNTS[clampedIndex];
    setSliderIndex(clampedIndex);
    setCustomValue(String(nearestValue));
    onChange(nearestValue);
  };

  const handlePointerPosition = (clientX: number) => {
    if (!trackRef.current) return;

    const { left, width } = trackRef.current.getBoundingClientRect();
    const ratio = (clientX - left) / width;
    const clampedRatio = Math.min(Math.max(ratio, 0), 1);
    const index = Math.round(clampedRatio * (PRESET_AMOUNTS.length - 1));
    updateFromIndex(index);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    handlePointerPosition(event.clientX);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      handlePointerPosition(moveEvent.clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateFromIndex(sliderIndex - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      updateFromIndex(sliderIndex + 1);
    }
  };

  const handleCustomBlur = () => {
    const numericValue = Math.max(0, Number(customValue) || 0);
    const nearestIndex = findNearestStopIndex(numericValue);
    updateFromIndex(nearestIndex);
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200/90 bg-white/90 p-4 shadow-subtle">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">Initial investment</p>
          <p className="text-xs text-slate-600">Start strong with an upfront amount.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-0 text-xs font-semibold text-slate-700"
          onClick={() => setShowCustom((prev) => !prev)}
        >
          Custom
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative h-10 overflow-hidden">
          <div
            className={clsx(
              "absolute inset-0 flex items-center text-3xl font-semibold text-slate-900 transition-all",
              isFading ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
            )}
            style={{ transitionDuration: "160ms", transitionTimingFunction: EASING }}
          >
            {formatCurrency(displayValue)}
          </div>
        </div>

        <div className="space-y-2">
          <div
            ref={trackRef}
            className="relative h-10 cursor-pointer"
            onPointerDown={handlePointerDown}
            onKeyDown={handleKeyDown}
            role="slider"
            aria-valuemin={PRESET_AMOUNTS[0]}
            aria-valuemax={PRESET_AMOUNTS[PRESET_AMOUNTS.length - 1]}
            aria-valuenow={displayValue}
            tabIndex={0}
          >
            <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-slate-200" />
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-900"
              style={{
                width: `${progress}%`,
                transition: `width ${isDragging ? 0 : 160}ms ${EASING}`
              }}
            />

            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2">
              <div className="relative h-6">
                <div
                  className="absolute flex h-6 w-full items-center"
                  style={{ transition: `transform 120ms ${EASING}` }}
                >
                  <div
                    className="h-6 w-6 rounded-full bg-slate-900 shadow-lg"
                    style={{
                      transform: `translateX(calc(${progress}% - 50%)) scale(${isDragging ? 1.02 : 1})`,
                      transition: `transform ${isDragging ? 60 : 160}ms ${EASING}`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2">
              <div className="flex w-full justify-between px-1">
                {PRESET_AMOUNTS.map((stop, index) => (
                  <div key={stop} className="flex flex-col items-center gap-1">
                    <span
                      className={clsx(
                        "block h-2 w-px rounded-full bg-slate-400",
                        index === 0 || index === PRESET_AMOUNTS.length - 1 ? "h-3" : "h-2"
                      )}
                    />
                    {index === 0 || index === PRESET_AMOUNTS.length - 1 ? (
                      <span className="text-[10px] text-slate-500">{formatCurrency(stop)}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Drag to adjust</span>
            <span>Snaps to presets</span>
          </div>
        </div>

        <div
          className="overflow-hidden"
          style={{
            maxHeight: showCustom ? 140 : 0,
            transition: `max-height ${showCustom ? 240 : 200}ms ${EASING}`
          }}
        >
          <div
            className={clsx(
              "rounded-xl border border-slate-200 bg-slate-50/80 p-3",
              showCustom ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-[6px] opacity-0"
            )}
            style={{
              transition: `opacity 200ms ${EASING} ${showCustom ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
                showCustom ? "50ms" : "0ms"
              }`
            }}
          >
            <label className="text-xs font-medium text-slate-700" htmlFor="customInitial">
              Custom initial amount
            </label>
            <div className="mt-2 flex items-center gap-2">
              <div className="relative w-full">
                <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-slate-500">$</span>
                <Input
                  id="customInitial"
                  type="number"
                  min={0}
                  value={customValue}
                  onChange={(event) => setCustomValue(event.target.value)}
                  onBlur={handleCustomBlur}
                  className="pl-7"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const numericValue = Math.max(0, Number(customValue) || 0);
                  const nearestIndex = findNearestStopIndex(numericValue);
                  updateFromIndex(nearestIndex);
                }}
              >
                Snap
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
