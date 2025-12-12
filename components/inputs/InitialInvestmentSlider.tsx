"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import clsx from "clsx";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/formatCurrency";

const PRESET_STOPS = [0, 1000, 5000, 10000, 25000, 50000, 100000, 250000, 1000000];
const EASING = "cubic-bezier(0.2, 0.9, 0.2, 1)";

interface InitialInvestmentSliderProps {
  value: number;
  onChange: (value: number) => void;
}

function getNearestIndex(target: number) {
  return PRESET_STOPS.reduce((bestIndex, stop, index) => {
    const currentDiff = Math.abs(target - stop);
    const bestDiff = Math.abs(target - PRESET_STOPS[bestIndex]);
    return currentDiff < bestDiff ? index : bestIndex;
  }, 0);
}

export function InitialInvestmentSlider({ value, onChange }: InitialInvestmentSliderProps) {
  const maxIndex = PRESET_STOPS.length - 1;
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(() => getNearestIndex(value));
  const [visibleValue, setVisibleValue] = useState(() => PRESET_STOPS[getNearestIndex(value)]);
  const [isDragging, setIsDragging] = useState(false);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState(() => value);

  useEffect(() => {
    const nearest = PRESET_STOPS[getNearestIndex(value)];
    if (nearest !== value) {
      onChange(nearest);
    }
    setPosition(getNearestIndex(nearest));
    setVisibleValue(nearest);
    setCustomValue(nearest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const nearestIndex = getNearestIndex(value);
    setPosition(nearestIndex);
    setCustomValue(value);
  }, [value]);

  useEffect(() => {
    const nextVisible = PRESET_STOPS[Math.round(position)];
    if (nextVisible === visibleValue) return;
    setFadeState("out");
    const timeout = setTimeout(() => {
      setVisibleValue(nextVisible);
      setFadeState("in");
    }, 80);

    return () => clearTimeout(timeout);
  }, [position, visibleValue]);

  const fillPercent = useMemo(() => (position / maxIndex) * 100, [maxIndex, position]);

  const updateFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = (clientX - rect.left) / rect.width;
    const clampedRatio = Math.min(Math.max(ratio, 0), 1);
    const rawIndex = clampedRatio * maxIndex;
    const nearestIndex = Math.round(rawIndex);
    setPosition(rawIndex);
    onChange(PRESET_STOPS[nearestIndex]);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    trackRef.current?.setPointerCapture(event.pointerId);
    setIsDragging(true);
    updateFromPointer(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromPointer(event.clientX);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    trackRef.current?.releasePointerCapture(event.pointerId);
    setIsDragging(false);
    const snappedIndex = Math.round(position);
    setPosition(snappedIndex);
  };

  const handleCustomBlur = () => {
    const sanitized = Math.max(0, Number(customValue) || 0);
    const nearestIndex = getNearestIndex(sanitized);
    const nextValue = PRESET_STOPS[nearestIndex];
    setPosition(nearestIndex);
    setCustomValue(nextValue);
    onChange(nextValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <Label className="text-sm font-medium text-slate-700">Initial investment</Label>
          <p className="text-xs text-slate-600">Choose an upfront amount to kickstart growth.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-2 text-xs font-semibold text-slate-700"
          onClick={() => setShowCustomInput((prev) => !prev)}
        >
          Custom
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-4 shadow-subtle">
        <div className="relative h-10 overflow-hidden">
          <p
            className={clsx(
              "absolute inset-0 flex items-center text-3xl font-semibold text-slate-900 transition-all",
              fadeState === "in" ? "opacity-100 translate-y-0" : "translate-y-1 opacity-0"
            )}
            style={{ transitionTimingFunction: EASING, transitionDuration: "160ms" }}
            aria-live="polite"
          >
            {formatCurrency(visibleValue)}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <div
            ref={trackRef}
            className="relative h-10 cursor-pointer touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            role="slider"
            aria-valuemin={PRESET_STOPS[0]}
            aria-valuemax={PRESET_STOPS[maxIndex]}
            aria-valuenow={visibleValue}
            aria-label="Initial investment slider"
          >
            <div className="absolute inset-y-[18px] left-0 right-0 rounded-full bg-slate-200" />
            <div
              className="absolute inset-y-[18px] left-0 rounded-full bg-slate-900"
              style={{
                width: `${fillPercent}%`,
                transitionTimingFunction: EASING,
                transitionDuration: isDragging ? "80ms" : "160ms"
              }}
            />

            <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-between px-[2px]">
              {PRESET_STOPS.map((stop, index) => {
                const isMajor = index === 0 || index === PRESET_STOPS.length - 1 || stop >= 100000;
                return (
                  <div key={stop} className="flex flex-col items-center" aria-hidden>
                    <span
                      className={clsx(
                        "block h-2 w-[2px] rounded-full bg-slate-400", // tick
                        isMajor && "h-3 bg-slate-500"
                      )}
                    />
                    {isMajor && (
                      <span className="mt-1 text-[10px] font-semibold text-slate-500">${stop >= 1000 ? `${stop / 1000}k` : stop}</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              className="absolute top-1/2 -mt-3 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow-lg"
              style={{
                left: `${fillPercent}%`,
                transitionTimingFunction: EASING,
                transitionDuration: isDragging ? "80ms" : "160ms"
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Drag to snap between suggested amounts</span>
            <span className="font-semibold text-slate-800">${PRESET_STOPS[0].toLocaleString()}–${
              PRESET_STOPS[PRESET_STOPS.length - 1].toLocaleString()
            }</span>
          </div>
        </div>

        <div
          className="overflow-hidden"
          style={{
            maxHeight: showCustomInput ? 120 : 0,
            transition: `max-height ${showCustomInput ? 240 : 200}ms ${EASING}`
          }}
        >
          <div
            className={clsx(
              "mt-3 space-y-2 rounded-xl border border-slate-200 bg-white/70 p-3",
              showCustomInput
                ? "opacity-100 translate-y-0"
                : "pointer-events-none translate-y-[6px] opacity-0"
            )}
            style={{ transition: `opacity 200ms ${EASING} ${showCustomInput ? "50ms" : "0ms"}, transform 220ms ${EASING}` }}
          >
            <Label htmlFor="initialCustomInput" className="text-xs font-medium text-slate-700">
              Enter a custom amount
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-slate-500">$</span>
              <Input
                id="initialCustomInput"
                type="number"
                min={0}
                value={customValue}
                onChange={(event) => setCustomValue(Number(event.target.value))}
                onBlur={handleCustomBlur}
                className="pl-7"
              />
            </div>
            <p className="text-[11px] text-slate-500">We’ll snap to the nearest suggested stop when you finish typing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const INITIAL_INVESTMENT_STOPS = PRESET_STOPS;
