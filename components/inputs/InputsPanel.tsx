"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "./SectionHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TooltipIcon } from "./TooltipIcon";
import clsx from "clsx";
import { Inputs } from "@/lib/calculations/calculateProjection";
import { ContributionSelector } from "./ContributionSelector";

const INTEREST_RATE_OPTIONS = [3, 5, 7, 10];
const CONTRIBUTE_YEAR_OPTIONS = [10, 20, 30];
const PROJECT_YEAR_OPTIONS = [20, 30, 40];
const MAX_PROJECT_YEARS = Math.max(...PROJECT_YEAR_OPTIONS);
const EASING = "cubic-bezier(0.2, 0.9, 0.2, 1)";
const INITIAL_PRESET_STOPS = [0, 1000, 5000, 10000, 25000, 50000, 100000, 250000, 1000000];

const findNearestPresetIndex = (value: number) => {
  return INITIAL_PRESET_STOPS.reduce(
    (closest, current, index) => {
      const distance = Math.abs(current - value);
      if (distance < closest.distance) {
        return { index, distance };
      }
      return closest;
    },
    { index: 0, distance: Number.POSITIVE_INFINITY }
  ).index;
};

interface InputsPanelProps {
  inputs: Inputs;
  onChange: (inputs: Inputs) => void;
}

export function InputsPanel({ inputs, onChange }: InputsPanelProps) {
  const [draft, setDraft] = useState<Inputs>(inputs);

  useEffect(() => {
    const id = setTimeout(() => onChange(draft), 250);
    return () => clearTimeout(id);
  }, [draft, onChange]);

  useEffect(() => {
    setDraft(inputs);
  }, [inputs]);

  const updateField = <K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };
  const showDurationWarning = draft.projectYears < draft.contributeYears;
  const totalYears = draft.projectYears;
  const contributionYears = Math.min(draft.contributeYears, totalYears);
  const timeHorizonTooltip = `Growth applies throughout the entire projection. Contributions stop after year ${contributionYears}.`;

  return (
    <Card className="sticky top-6 h-fit w-full max-w-[420px] border-slate-200 bg-white/90 shadow-subtle">
      <CardHeader className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-slate-500">Inputs</p>
        <h2 className="text-xl font-semibold text-slate-900">Plan your growth</h2>
        <p className="text-sm text-slate-600">
          Adjust the knobs to see how your recurring contributions shape your balance.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-subtle">
          <SectionHeader
            title="Contributions"
            tooltip="Set your starting amount and recurring contributions to power your plan."
          />
          <div className="space-y-5">
            <InitialInvestmentSlider value={draft.initialDeposit} onChange={(val) => updateField("initialDeposit", val)} />

            <ContributionSelector
              value={draft.recurringAmount}
              onChange={(val) => updateField("recurringAmount", val)}
              label="Recurring contributions"
              tooltip="Your planned monthly contribution."
            />

          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-subtle">
          <SectionHeader
            title="Time Horizon"
            tooltip={timeHorizonTooltip}
          />
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Contribute for (years)</Label>
              <div className="flex gap-2" role="group" aria-label="Contribute for (years)">
                {CONTRIBUTE_YEAR_OPTIONS.map((option) => {
                  const isSelected = draft.contributeYears === option;

                  return (
                    <Button
                      key={option}
                      type="button"
                      variant={isSelected ? "secondary" : "outline"}
                      className="flex-1"
                      aria-pressed={isSelected}
                      onClick={() => updateField("contributeYears", option)}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Project over (years)</Label>
              <div className="flex gap-2" role="group" aria-label="Project over (years)">
                {PROJECT_YEAR_OPTIONS.map((option) => {
                  const isSelected = draft.projectYears === option;

                  return (
                    <Button
                      key={option}
                      type="button"
                      variant={isSelected ? "secondary" : "outline"}
                      className="flex-1"
                      aria-pressed={isSelected}
                      onClick={() => updateField("projectYears", option)}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <TimelineBar contributeYears={draft.contributeYears} projectYears={draft.projectYears} />
            {showDurationWarning && (
              <p className="text-xs text-amber-600">Projection horizon is shorter than the contribution period.</p>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white/60 p-3 shadow-sm">
          <SectionHeader
            title="Assumptions"
            tooltip="Average annual return you expect to earn. Returns are annualized; contributions are applied monthly."
          />
          <div className="space-y-2">
            <div className="flex gap-2" role="group" aria-label="Annual interest rate">
              {INTEREST_RATE_OPTIONS.map((option) => {
                const isSelected = draft.interestRate === option;

                return (
                  <Button
                    key={option}
                    type="button"
                    variant={isSelected ? "secondary" : "outline"}
                    className="flex-1"
                    aria-pressed={isSelected}
                    onClick={() => updateField("interestRate", option)}
                  >
                    {option}%
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface InitialInvestmentSliderProps {
  value: number;
  onChange: (value: number) => void;
}

function InitialInvestmentSlider({ value, onChange }: InitialInvestmentSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const moveListenerRef = useRef<(event: PointerEvent) => void>();
  const upListenerRef = useRef<() => void>();
  const [isDragging, setIsDragging] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState<string>((value || 0).toString());

  useEffect(() => {
    setCustomValue((value || 0).toString());
  }, [value]);

  const valueToRatio = (amount: number) => {
    const stops = INITIAL_PRESET_STOPS;
    if (stops.length < 2) return 0;

    const capped = Math.max(stops[0], Math.min(amount, stops[stops.length - 1]));
    if (capped <= stops[0]) return 0;
    if (capped >= stops[stops.length - 1]) return 1;

    for (let i = 0; i < stops.length - 1; i++) {
      const lower = stops[i];
      const upper = stops[i + 1];
      if (capped >= lower && capped <= upper) {
        const fraction = (capped - lower) / (upper - lower);
        return (i + fraction) / (stops.length - 1);
      }
    }

    return 0;
  };

  const ratioToValue = (ratio: number) => {
    const stops = INITIAL_PRESET_STOPS;
    if (stops.length < 2) return stops[0] || 0;

    const normalized = Math.min(Math.max(ratio, 0), 1) * (stops.length - 1);
    const lowerIndex = Math.floor(normalized);
    const upperIndex = Math.min(Math.ceil(normalized), stops.length - 1);

    if (lowerIndex === upperIndex) {
      return stops[lowerIndex];
    }

    const lower = stops[lowerIndex];
    const upper = stops[upperIndex];
    const fraction = normalized - lowerIndex;
    return lower + fraction * (upper - lower);
  };

  const commitValue = (nextValue: number) => {
    const sanitized = Math.max(0, Number.isFinite(nextValue) ? Math.round(nextValue) : 0);
    if (sanitized !== value) {
      onChange(sanitized);
      setAnimationKey((prev) => prev + 1);
    }
  };

  const handlePointerPosition = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const ratio = rect.width === 0 ? 0 : Math.max(0, Math.min(clientX - rect.left, rect.width)) / rect.width;
    const nextValue = ratioToValue(ratio);
    const snapped = INITIAL_PRESET_STOPS[findNearestPresetIndex(nextValue)];
    commitValue(snapped);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    handlePointerPosition(event.clientX);

    const handleMove = (moveEvent: PointerEvent) => handlePointerPosition(moveEvent.clientX);
    const handleUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      moveListenerRef.current = undefined;
      upListenerRef.current = undefined;
    };

    moveListenerRef.current = handleMove;
    upListenerRef.current = handleUp;

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  useEffect(() => {
    return () => {
      if (moveListenerRef.current) {
        window.removeEventListener("pointermove", moveListenerRef.current);
      }

      if (upListenerRef.current) {
        window.removeEventListener("pointerup", upListenerRef.current);
      }
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const stepDirection =
      event.key === "ArrowLeft" || event.key === "ArrowDown"
        ? -1
        : event.key === "ArrowRight" || event.key === "ArrowUp"
          ? 1
          : 0;

    if (stepDirection !== 0) {
      event.preventDefault();
      const nearestIndex = findNearestPresetIndex(value);
      const nextIndex = Math.min(
        Math.max(nearestIndex + stepDirection, 0),
        INITIAL_PRESET_STOPS.length - 1
      );
      commitValue(INITIAL_PRESET_STOPS[nextIndex]);
    }
  };

  const handleCustomBlur = () => {
    const numericValue = Math.max(0, Math.round(Number(customValue) || 0));
    setCustomValue(numericValue.toString());
    onChange(numericValue);
    setAnimationKey((prev) => prev + 1);
  };

  const roundedValue = Math.max(0, Math.round(value || 0));
  const sliderRatio = valueToRatio(roundedValue);
  const nearestStopIndex = findNearestPresetIndex(roundedValue);
  const progress = sliderRatio * 100;
  const displayAmount = roundedValue;

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white/70 p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">Initial investment</p>
          <TooltipIcon text="Set a lump sum to kickstart your plan." />
        </div>
        <button
          type="button"
          onClick={() => setShowCustom((prev) => !prev)}
          className="text-sm font-semibold text-slate-700 underline-offset-4 transition hover:text-slate-900 hover:underline"
        >
          Custom
        </button>
      </div>

      <div className="flex items-end gap-2">
        <span
          key={animationKey}
          className="amount-fade-slide block text-2xl font-semibold text-slate-900"
          style={{ animationTimingFunction: EASING }}
        >
          ${displayAmount.toLocaleString()}
        </span>
        <span className="text-sm text-slate-600">up front</span>
      </div>

      <div className="relative mt-2 h-12 select-none">
        <div
          ref={sliderRef}
          className="relative h-full cursor-pointer"
          onPointerDown={handlePointerDown}
          role="slider"
          aria-valuemin={INITIAL_PRESET_STOPS[0]}
          aria-valuemax={INITIAL_PRESET_STOPS[INITIAL_PRESET_STOPS.length - 1]}
          aria-valuenow={displayAmount}
          aria-valuetext={`$${displayAmount.toLocaleString()}`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-200" />
          <div
            className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-900/90"
            style={{ width: `${progress}%`, transition: `width 160ms ${EASING}` }}
          />

          {INITIAL_PRESET_STOPS.map((stop, index) => (
            <span
              key={stop}
              className="absolute top-1/2 h-3 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-500/50"
              style={{
                left: `${(index / (INITIAL_PRESET_STOPS.length - 1)) * 100}%`,
                opacity: index === nearestStopIndex ? 0.9 : 0.55,
                transition: `opacity 160ms ${EASING}`
              }}
              aria-hidden
            />
          ))}

          <div
            className={clsx(
              "absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-subtle ring-2 ring-slate-900",
              isDragging ? "scale-105 ring-4 shadow-md" : ""
            )}
            style={{
              left: `${progress}%`,
              transition: `left 160ms ${EASING}, transform 160ms ${EASING}, box-shadow 160ms ${EASING}`
            }}
          />
        </div>
      </div>

      <div
        className="overflow-hidden"
        style={{
          maxHeight: showCustom ? 160 : 0,
          transition: `max-height ${showCustom ? 240 : 200}ms ${EASING}`
        }}
      >
        <div
          className={clsx(
            "rounded-xl border border-slate-200 bg-slate-50/70 p-3",
            showCustom ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-[6px] opacity-0"
          )}
          style={{
            transition: `opacity 200ms ${EASING} ${showCustom ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
              showCustom ? "50ms" : "0ms"
            }`
          }}
        >
          <Label htmlFor="customInitial" className="text-xs font-medium text-slate-700">
            Custom initial amount
          </Label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-2.5 text-sm text-slate-500">$</span>
            <Input
              id="customInitial"
              type="number"
              min={0}
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onBlur={handleCustomBlur}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleCustomBlur();
                }
              }}
              className="pl-7"
            />
          </div>
          <p className="pt-1 text-xs text-slate-500">We’ll use exactly what you enter here.</p>
        </div>
      </div>
    </div>
  );
}

interface TimelineBarProps {
  contributeYears: number;
  projectYears: number;
}

function TimelineBar({ contributeYears, projectYears }: TimelineBarProps) {
  const totalYears = projectYears;
  const contributionYears = Math.min(contributeYears, totalYears);
  const growthOnlyYears = Math.max(totalYears - contributionYears, 0);
  const projectWidth = (projectYears / MAX_PROJECT_YEARS) * 100;
  const contributionWidth = projectYears
    ? Math.min((contributeYears / projectYears) * 100, 100)
    : 0;
  const contributionYears = Math.min(contributeYears, projectYears);
  const growthOnlyYears = Math.max(totalYears - contributionYears, 0);

  const projectWidth = (totalYears / MAX_PROJECT_YEARS) * 100;
  const contributionWidth = totalYears ? Math.min((contributionYears / totalYears) * 100, 100) : 0;

  const ariaLabelParts = [] as string[];
  if (contributionYears) ariaLabelParts.push(`${contributionYears} years contributing`);
  if (growthOnlyYears) ariaLabelParts.push(`${growthOnlyYears} years growing`);
  const ariaLabel = ariaLabelParts.length ? ariaLabelParts.join(", ") : `${totalYears} year projection`;

  const timelineCopy =
    growthOnlyYears === 0
      ? `${totalYears}-year projection • contributions throughout`
      : contributionYears === 0
        ? `${totalYears}-year projection • growth-only`
        : `${totalYears}-year projection • ${contributionYears} yrs contributing, ${growthOnlyYears} yrs growth-only`;

  return (
    <div className="space-y-2">
      <div
        className="relative flex cursor-default flex-col gap-2"
        aria-label={timelineCopy}
      >
      <div className="relative flex cursor-default flex-col gap-2" aria-label={ariaLabel}>
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="relative h-2 rounded-full bg-slate-200"
            style={{ width: `${projectWidth}%`, transition: "width 200ms ease-out" }}
          >
            <div
              className="absolute left-0 top-0 h-2 rounded-full bg-slate-700"
              style={{ width: `${contributionWidth}%`, transition: "width 180ms ease-out" }}
            />
          </div>
        </div>

        <div className="text-xs text-slate-600">
          {timelineCopy}
        <div className="flex flex-col gap-1 text-xs text-slate-600">
          <div className="font-medium text-slate-700">{`Total projection: ${totalYears} years`}</div>

          <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
            {growthOnlyYears === 0 && contributionYears ? (
              <span className="whitespace-nowrap">{`${totalYears} years contributions + growth`}</span>
            ) : contributionYears === 0 && growthOnlyYears ? (
              <span className="whitespace-nowrap">{`${totalYears} years growth only`}</span>
            ) : contributionYears && growthOnlyYears ? (
              <>
                <span className="whitespace-nowrap">{`${contributionYears} years contributions + growth`}</span>
                <span aria-hidden="true">→</span>
                <span className="whitespace-nowrap">{`${growthOnlyYears} years growth only`}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
