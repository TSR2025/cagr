"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { clampStartingAge, normalizeContributionEndAge } from "@/lib/timeModel";

const DURATION_OPTIONS = [10, 20, 30, 40];
const DEFAULT_DURATION = 30;

interface TimeControlsProps {
  startingAge: number;
  onStartingAgeChange: (next: number) => void;
  stopContributingAge: number;
  onStopContributingAgeChange: (next: number) => void;
  minAge: number;
  maxAge: number;
  className?: string;
}

export function TimeControls({
  startingAge,
  onStartingAgeChange,
  stopContributingAge,
  onStopContributingAgeChange,
  minAge,
  maxAge,
  className
}: TimeControlsProps) {
  const [startingDraft, setStartingDraft] = useState(startingAge.toString());

  useEffect(() => {
    setStartingDraft(startingAge.toString());
  }, [startingAge]);

  const commitStartingAge = (value: number) => {
    const next = clampStartingAge(value);
    setStartingDraft(next.toString());
    onStartingAgeChange(next);
  };

  const handleDurationSelect = (duration: number) => {
    const targetEndAge = startingAge + duration;
    const snapped = normalizeContributionEndAge(startingAge, targetEndAge, maxAge);
    onStopContributingAgeChange(snapped);
  };

  const handleStartingBlur = () => commitStartingAge(Number(startingDraft));

  const contributionYears = stopContributingAge - startingAge;
  const selectedDuration = DURATION_OPTIONS.includes(contributionYears)
    ? contributionYears
    : DEFAULT_DURATION;

  useEffect(() => {
    if (!DURATION_OPTIONS.includes(contributionYears)) {
      const snapped = normalizeContributionEndAge(startingAge, startingAge + DEFAULT_DURATION, maxAge);
      onStopContributingAgeChange(snapped);
    }
  }, [contributionYears, maxAge, onStopContributingAgeChange, startingAge]);

  return (
    <div className={clsx("flex min-w-[260px] flex-col gap-3 text-[13px] text-slate-900", className)}>
      <p className="text-sm font-medium text-slate-600">When you invest</p>

      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-subtle">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">Start age</p>
          <div className="flex items-center gap-3">
            <div className="relative inline-flex h-10 w-[132px] items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-subtle">
              <Input
                type="number"
                inputMode="numeric"
                min={minAge}
                max={maxAge}
                value={startingDraft}
                onChange={(event) => setStartingDraft(event.target.value)}
                onBlur={handleStartingBlur}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleStartingBlur();
                  }
                }}
                className="h-full w-full border-none px-3 pr-10 text-center text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="absolute right-0 top-0 flex h-full w-10 flex-col divide-y divide-slate-200 bg-slate-50">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Increase starting age"
                  onClick={() => commitStartingAge(Number(startingDraft) + 1)}
                  className="h-1/2 rounded-none px-2 text-base text-slate-700 hover:bg-slate-100"
                >
                  +
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease starting age"
                  onClick={() => commitStartingAge(Number(startingDraft) - 1)}
                  className="h-1/2 rounded-none px-2 text-base text-slate-700 hover:bg-slate-100"
                >
                  −
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Contribute for</p>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">years</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DURATION_OPTIONS.map((duration) => {
              const isSelected = duration === selectedDuration;
              return (
                <Button
                  key={duration}
                  type="button"
                  variant={isSelected ? "secondary" : "outline"}
                  aria-pressed={isSelected}
                  onClick={() => handleDurationSelect(duration)}
                  className="h-11 w-full justify-center text-base font-semibold"
                >
                  {duration}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
