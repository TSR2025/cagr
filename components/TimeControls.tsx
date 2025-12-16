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
    <div className={clsx("flex flex-col gap-3 text-sm text-slate-900", className)}>
      <p className="text-sm font-semibold text-slate-700">When you invest</p>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-slate-700">Start age</p>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Decrease starting age"
              onClick={() => commitStartingAge(Number(startingDraft) - 1)}
              className="h-7 w-7 rounded-md px-0 text-sm"
            >
              −
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
              className="h-8 w-[72px] rounded-md px-2 text-center text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Increase starting age"
              onClick={() => commitStartingAge(Number(startingDraft) + 1)}
              className="h-7 w-7 rounded-md px-0 text-sm"
            >
              +
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[13px] font-medium text-slate-700">Contribute for</p>
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
                  className={clsx(
                    "h-9 w-full justify-center text-[13px] font-medium",
                    isSelected ? "ring-1 ring-slate-300" : "text-slate-600"
                  )}
                >
                  {duration}
                </Button>
              );
            })}
          </div>
          <p className="text-[12px] text-slate-500">years</p>
        </div>
      </div>
    </div>
  );
}
