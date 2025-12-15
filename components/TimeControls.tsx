"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { clampStartingAge, normalizeContributionEndAge } from "@/lib/timeModel";

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
  minWindowYears,
  snapIncrementYears,
  className
}: TimeControlsProps) {
  const [startingDraft, setStartingDraft] = useState(startingAge.toString());
  const [stopDraft, setStopDraft] = useState(stopContributingAge.toString());

  useEffect(() => {
    setStartingDraft(startingAge.toString());
  }, [startingAge]);

  useEffect(() => {
    setStopDraft(stopContributingAge.toString());
  }, [stopContributingAge]);

  const commitStartingAge = (value: number) => {
    const next = clampStartingAge(value);
    setStartingDraft(next.toString());
    onStartingAgeChange(next);
  };

  const commitStopAge = (value: number) => {
    const snapped = normalizeContributionEndAge(startingAge, value, maxAge);
    setStopDraft(snapped.toString());
    onStopContributingAgeChange(snapped);
  };

  const handleStartingBlur = () => commitStartingAge(Number(startingDraft));
  const handleStopBlur = () => commitStopAge(Number(stopDraft));

  return (
    <div className={clsx("w-full min-w-[240px] max-w-[320px] rounded-xl border border-slate-200 bg-white/80 p-3 shadow-subtle", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Time</p>
      <div className="mt-2 space-y-3 text-sm text-slate-900">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-600">Starting age</p>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Decrease starting age"
              onClick={() => commitStartingAge(Number(startingDraft) - 1)}
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
              className="w-[96px] text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Increase starting age"
              onClick={() => commitStartingAge(Number(startingDraft) + 1)}
            >
              +
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-600">Stop contributing at age</p>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Decrease stop contributing age"
              onClick={() => commitStopAge(Number(stopDraft) - 1)}
            >
              −
            </Button>
            <Input
              type="number"
              inputMode="numeric"
              min={minAge + minWindowYears}
              max={maxAge}
              step={snapIncrementYears}
              value={stopDraft}
              onChange={(event) => setStopDraft(event.target.value)}
              onBlur={handleStopBlur}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleStopBlur();
                }
              }}
              className="w-[96px] text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Increase stop contributing age"
              onClick={() => commitStopAge(Number(stopDraft) + 1)}
            >
              +
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
