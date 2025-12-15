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
    <div
      className={clsx(
        "inline-grid min-w-[220px] grid-cols-[auto,1fr] items-center gap-x-3 gap-y-2 rounded-lg border border-slate-200/90 bg-white/75 p-2 text-[13px] text-slate-900",
        className
      )}
    >
      <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Time</p>

      <p className="text-[12px] font-medium text-slate-700">Starting age</p>
      <div className="flex items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Decrease starting age"
          onClick={() => commitStartingAge(Number(startingDraft) - 1)}
          className="h-8 w-8 rounded-md text-base"
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
          className="h-8 w-[88px] rounded-md px-2 text-center text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Increase starting age"
          onClick={() => commitStartingAge(Number(startingDraft) + 1)}
          className="h-8 w-8 rounded-md text-base"
        >
          +
        </Button>
      </div>

      <p className="text-[12px] font-medium text-slate-700">Stop contributing at age</p>
      <div className="flex items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Decrease stop contributing age"
          onClick={() => commitStopAge(Number(stopDraft) - snapIncrementYears)}
          className="h-8 w-8 rounded-md text-base"
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
          className="h-8 w-[88px] rounded-md px-2 text-center text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Increase stop contributing age"
          onClick={() => commitStopAge(Number(stopDraft) + snapIncrementYears)}
          className="h-8 w-8 rounded-md text-base"
        >
          +
        </Button>
      </div>
    </div>
  );
}
