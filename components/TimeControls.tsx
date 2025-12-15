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
  minWindowYears: number;
  snapIncrementYears: number;
  className?: string;
}

export function TimeControls({
  startingAge,
  onStartingAgeChange,
  stopContributingAge,
  onStopContributingAgeChange,
  minAge,
  maxAge,
  minWindowYears: _minWindowYears,
  snapIncrementYears: _snapIncrementYears,
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
    <div className={clsx("flex min-w-[240px] flex-col gap-1.5 text-[13px] text-slate-900", className)}>
      <p className="text-[12px] font-semibold text-slate-500">When you invest</p>

      <div className="rounded-lg border border-slate-200/80 bg-white/70 p-2.5">
        <div className="grid grid-cols-[120px_minmax(0,1fr)] items-start gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[12px] font-medium text-slate-700">Start age</p>
            <div className="flex flex-col items-center gap-1 rounded-md border border-slate-200/80 bg-white px-1.5 py-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Increase starting age"
                onClick={() => commitStartingAge(Number(startingDraft) + 1)}
                className="h-7 w-8 rounded-md text-[15px]"
              >
                ▲
              </Button>
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
                className="h-9 w-[72px] rounded-md px-2 text-center text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Decrease starting age"
                onClick={() => commitStartingAge(Number(startingDraft) - 1)}
                className="h-7 w-8 rounded-md text-[15px]"
              >
                ▼
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[12px] font-medium text-slate-700">Contribute for</p>
            <div className="flex items-start gap-2">
              <div className="grid grid-cols-2 gap-1.5">
                {DURATION_OPTIONS.map((duration) => {
                  const isSelected = duration === selectedDuration;
                  return (
                    <Button
                      key={duration}
                      type="button"
                      variant={isSelected ? "secondary" : "outline"}
                      aria-pressed={isSelected}
                      onClick={() => handleDurationSelect(duration)}
                      className="h-9 w-16 justify-center text-sm"
                    >
                      {duration}
                    </Button>
                  );
                })}
              </div>
              <span className="mt-1 text-[12px] font-medium text-slate-600">years</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
