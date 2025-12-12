"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "./SectionHeader";
import { OneTimeBoostsSection } from "./OneTimeBoostsSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TooltipIcon } from "./TooltipIcon";
import clsx from "clsx";
import { Inputs, OneTimeBoost } from "@/lib/calculations/calculateProjection";
import { ContributionSelector } from "./ContributionSelector";
import { ChevronDown } from "lucide-react";

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
  const normalizedInitialDeposit = INITIAL_PRESET_STOPS[findNearestPresetIndex(inputs.initialDeposit)];
  const [draft, setDraft] = useState<Inputs>({ ...inputs, initialDeposit: normalizedInitialDeposit });
  const [boostMode, setBoostMode] = useState<"none" | "add">(
    (inputs.boosts || []).some((boost) => boost.amount || boost.year || boost.label) ? "add" : "none"
  );
  const [savedBoosts, setSavedBoosts] = useState<OneTimeBoost[]>(inputs.boosts || []);
  const [showBoosts, setShowBoosts] = useState(() =>
    (inputs.boosts || []).some((boost) => boost.amount || boost.year || boost.label)
  );

  useEffect(() => {
    const id = setTimeout(() => onChange(draft), 250);
    return () => clearTimeout(id);
  }, [draft, onChange]);

  useEffect(() => {
    const nearestIndex = findNearestPresetIndex(inputs.initialDeposit);
    const normalizedDeposit = INITIAL_PRESET_STOPS[nearestIndex];

    setDraft({ ...inputs, initialDeposit: normalizedDeposit });
  }, [inputs]);

  useEffect(() => {
    const hasBoosts = (inputs.boosts || []).some((boost) => boost.amount || boost.year || boost.label);
    setBoostMode(hasBoosts ? "add" : "none");
    if (hasBoosts) {
      setSavedBoosts(inputs.boosts || []);
      setShowBoosts(true);
    }
  }, [inputs.boosts]);

  const updateField = <K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const boostValues = useMemo(() => draft.boosts || [], [draft.boosts]);
  const showDurationWarning = draft.projectYears < draft.contributeYears;
  const hasBoostsConfigured = useMemo(
    () => boostValues.some((boost) => boost.amount || boost.year || boost.label),
    [boostValues]
  );

  const handleBoostModeChange = (mode: "none" | "add") => {
    setBoostMode(mode);
    if (mode === "none") {
      if (hasBoostsConfigured) {
        setSavedBoosts(boostValues);
      }
      updateField("boosts", [] as OneTimeBoost[]);
      return;
    }

    const nextBoosts = boostValues.length ? boostValues : savedBoosts;
    updateField("boosts", (nextBoosts || []) as OneTimeBoost[]);
  };

  return (
    <Card className="sticky top-6 h-fit w-full max-w-[420px] border-slate-200 bg-white/90 shadow-subtle">
      <CardHeader className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-slate-500">Inputs</p>
        <h2 className="text-xl font-semibold text-slate-900">Plan your growth</h2>
        <p className="text-sm text-slate-600">
          Adjust the knobs to see how recurring contributions and boosts shape your balance.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-subtle">
          <SectionHeader
            title="Contributions"
            tooltip="Set your recurring contributions and optional boosts to power your plan."
          />
          <div className="space-y-5">
            <InitialInvestmentSlider value={draft.initialDeposit} onChange={(val) => updateField("initialDeposit", val)} />

            <ContributionSelector
              value={draft.recurringAmount}
              onChange={(val) => updateField("recurringAmount", val)}
              label="Recurring contributions"
              tooltip="Your planned monthly contribution."
            />

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowBoosts((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-sm font-semibold text-slate-800 transition hover:text-slate-900"
                aria-expanded={showBoosts}
              >
                <span className="flex items-center gap-2">One-time boosts (optional)</span>
                <ChevronDown
                  className="h-4 w-4 text-slate-500 transition-transform"
                  style={{
                    transform: `rotate(${showBoosts ? 180 : 0}deg)`,
                    transitionTimingFunction: EASING,
                    transitionDuration: "200ms"
                  }}
                />
              </button>

              <div
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/80"
                style={{
                  maxHeight: showBoosts ? 1200 : 0,
                  transition: `max-height ${showBoosts ? 300 : 240}ms ${EASING}`
                }}
              >
                <div
                  className={clsx(
                    "space-y-5 px-4 pb-5 pt-2",
                    showBoosts ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-[6px] opacity-0"
                  )}
                  style={{
                    transition: `opacity 200ms ${EASING} ${showBoosts ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
                      showBoosts ? "50ms" : "0ms"
                    }`
                  }}
                >
                  <div className="space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800">One-time boosts</p>
                        <p className="text-xs text-slate-600">Add occasional amounts like bonuses or windfalls.</p>
                      </div>
                      <div className="inline-flex rounded-full bg-white p-1 shadow-subtle">
                        {(["none", "add"] as const).map((option) => {
                          const isSelected = boostMode === option;
                          return (
                            <Button
                              key={option}
                              type="button"
                              variant={isSelected ? "secondary" : "ghost"}
                              size="sm"
                              className={clsx(
                                "rounded-full px-3 font-semibold capitalize transition",
                                isSelected ? "shadow-sm" : "text-slate-700"
                              )}
                              style={{ transitionTimingFunction: EASING, transitionDuration: "180ms" }}
                              onClick={() => handleBoostModeChange(option)}
                              aria-pressed={isSelected}
                            >
                              {option === "none" ? "None" : "Add boosts"}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div
                      className="overflow-hidden"
                      style={{
                        maxHeight: boostMode === "add" ? 720 : 0,
                        transition: `max-height ${boostMode === "add" ? 260 : 220}ms ${EASING}`
                      }}
                    >
                      <div
                        className={clsx(
                          "space-y-3 pt-2",
                          boostMode === "add"
                            ? "opacity-100 translate-y-0"
                            : "pointer-events-none translate-y-[6px] opacity-0"
                        )}
                        style={{
                          transition: `opacity 200ms ${EASING} ${boostMode === "add" ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
                            boostMode === "add" ? "50ms" : "0ms"
                          }`
                        }}
                      >
                        <OneTimeBoostsSection
                          boosts={boostValues}
                          onChange={(next) => updateField("boosts", next as OneTimeBoost[])}
                          maxYear={draft.projectYears}
                          showHeader={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-subtle">
          <SectionHeader
            title="Time Horizon"
            tooltip="Set how long you plan to contribute and how far out to project your balance."
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
  const [currentIndex, setCurrentIndex] = useState(() => findNearestPresetIndex(value));
  const [isDragging, setIsDragging] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState<string>((value || 0).toString());

  useEffect(() => {
    const nearestIndex = findNearestPresetIndex(value);
    setCurrentIndex(nearestIndex);
    setCustomValue((value || 0).toString());
  }, [value]);

  const updateIndex = (nextIndex: number) => {
    const clampedIndex = Math.min(Math.max(nextIndex, 0), INITIAL_PRESET_STOPS.length - 1);
    if (clampedIndex === currentIndex) return;
    setCurrentIndex(clampedIndex);
    setAnimationKey((prev) => prev + 1);

    const nextAmount = INITIAL_PRESET_STOPS[clampedIndex];
    if (nextAmount !== value) {
      onChange(nextAmount);
    }
  };

  const handlePointerPosition = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const ratio = rect.width === 0 ? 0 : Math.max(0, Math.min(clientX - rect.left, rect.width)) / rect.width;
    const approximateIndex = ratio * (INITIAL_PRESET_STOPS.length - 1);
    updateIndex(Math.round(approximateIndex));
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
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      updateIndex(currentIndex - 1);
    }

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      updateIndex(currentIndex + 1);
    }
  };

  const handleCustomBlur = () => {
    const numericValue = Math.max(0, Number(customValue) || 0);
    setCustomValue(numericValue.toString());
    onChange(numericValue);
    setAnimationKey((prev) => prev + 1);
  };

  const progress = (currentIndex / (INITIAL_PRESET_STOPS.length - 1)) * 100;
  const displayAmount = value || 0;

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
                opacity: index === currentIndex ? 0.9 : 0.55,
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
  const [showLabel, setShowLabel] = useState(false);
  const [ephemeralLabel, setEphemeralLabel] = useState(false);

  useEffect(() => {
    if (!ephemeralLabel) return;

    const timer = setTimeout(() => setEphemeralLabel(false), 1400);
    return () => clearTimeout(timer);
  }, [ephemeralLabel]);

  const postContributionYears = Math.max(projectYears - contributeYears, 0);
  const projectWidth = (projectYears / MAX_PROJECT_YEARS) * 100;
  const contributionWidth = projectYears
    ? Math.min((contributeYears / projectYears) * 100, 100)
    : 0;
  const revealLabel = showLabel || ephemeralLabel;

  return (
    <div className="space-y-2">
      <div
        className="group relative flex cursor-default flex-col gap-2"
        tabIndex={0}
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        onFocus={() => setShowLabel(true)}
        onBlur={() => setShowLabel(false)}
        onClick={() => setEphemeralLabel(true)}
        aria-label={`${contributeYears} years contributing, ${postContributionYears} years growing`}
      >
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

        <div
          className={clsx(
            "text-xs text-slate-600 transition-opacity duration-150 ease-out",
            revealLabel ? "opacity-100" : "opacity-0"
          )}
        >
          {`${contributeYears} yrs contributing • ${postContributionYears} yrs growing`}
        </div>
      </div>
    </div>
  );
}
