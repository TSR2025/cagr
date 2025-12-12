"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "./SectionHeader";
import { OneTimeBoostsSection } from "./OneTimeBoostsSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import clsx from "clsx";
import { Inputs, OneTimeBoost } from "@/lib/calculations/calculateProjection";
import { ContributionSelector } from "./ContributionSelector";
import { ChevronDown } from "lucide-react";

const INTEREST_RATE_OPTIONS = [3, 5, 7, 10];
const CONTRIBUTE_YEAR_OPTIONS = [10, 20, 30];
const PROJECT_YEAR_OPTIONS = [20, 30, 40];
const MAX_PROJECT_YEARS = Math.max(...PROJECT_YEAR_OPTIONS);
const EASING = "cubic-bezier(0.2, 0.9, 0.2, 1)";

interface InputsPanelProps {
  inputs: Inputs;
  onChange: (inputs: Inputs) => void;
}

export function InputsPanel({ inputs, onChange }: InputsPanelProps) {
  const [draft, setDraft] = useState<Inputs>(inputs);
  const [showScenarios, setShowScenarios] = useState(() => {
    const hasInitialInvestment = inputs.initialDeposit > 0;
    const hasBoosts = (inputs.boosts || []).some((boost) => boost.amount || boost.year || boost.label);
    return hasInitialInvestment || hasBoosts;
  });
  const [initialMode, setInitialMode] = useState<"none" | "add">(inputs.initialDeposit > 0 ? "add" : "none");
  const [boostMode, setBoostMode] = useState<"none" | "add">(
    (inputs.boosts || []).some((boost) => boost.amount || boost.year || boost.label) ? "add" : "none"
  );
  const [showCustomInitial, setShowCustomInitial] = useState(false);
  const [savedInitialDeposit, setSavedInitialDeposit] = useState(() => inputs.initialDeposit || 5000);
  const [savedBoosts, setSavedBoosts] = useState<OneTimeBoost[]>(inputs.boosts || []);

  useEffect(() => {
    const id = setTimeout(() => onChange(draft), 250);
    return () => clearTimeout(id);
  }, [draft, onChange]);

  useEffect(() => {
    setDraft(inputs);
  }, [inputs]);

  useEffect(() => {
    setInitialMode(inputs.initialDeposit > 0 ? "add" : "none");
    setSavedInitialDeposit(inputs.initialDeposit || 5000);
  }, [inputs.initialDeposit]);

  useEffect(() => {
    const hasBoosts = (inputs.boosts || []).some((boost) => boost.amount || boost.year || boost.label);
    setBoostMode(hasBoosts ? "add" : "none");
    if (hasBoosts) {
      setSavedBoosts(inputs.boosts || []);
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

  const handleInitialModeChange = (mode: "none" | "add") => {
    setInitialMode(mode);
    if (mode === "none") {
      setSavedInitialDeposit(draft.initialDeposit || savedInitialDeposit || 0);
      updateField("initialDeposit", 0);
    } else {
      updateField("initialDeposit", savedInitialDeposit || 5000);
    }
  };

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
          <ContributionSelector
            value={draft.recurringAmount}
            onChange={(val) => updateField("recurringAmount", val)}
            tooltip="Your planned monthly contribution."
          />

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowScenarios((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-sm font-semibold text-slate-800 transition hover:text-slate-900"
              aria-expanded={showScenarios}
            >
              <span className="flex items-center gap-2">+ Add scenarios (optional)</span>
              <ChevronDown
                className="h-4 w-4 text-slate-500 transition-transform"
                style={{
                  transform: `rotate(${showScenarios ? 180 : 0}deg)`,
                  transitionTimingFunction: EASING,
                  transitionDuration: "200ms"
                }}
              />
            </button>

            <div
              className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/80"
              style={{
                maxHeight: showScenarios ? 1200 : 0,
                transition: `max-height ${showScenarios ? 300 : 240}ms ${EASING}`
              }}
            >
              <div
                className={clsx(
                  "space-y-5 px-4 pb-5 pt-2",
                  showScenarios ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-[6px] opacity-0"
                )}
                style={{
                  transition: `opacity 200ms ${EASING} ${showScenarios ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
                    showScenarios ? "50ms" : "0ms"
                  }`
                }}
              >
                <div className="space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800">Initial investment</p>
                    </div>
                    <div className="inline-flex rounded-full bg-white p-1 shadow-subtle">
                      {(["none", "add"] as const).map((option) => {
                        const isSelected = initialMode === option;
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
                            onClick={() => handleInitialModeChange(option)}
                            aria-pressed={isSelected}
                          >
                            {option === "none" ? "None" : "Add initial investment"}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    className="overflow-hidden"
                    style={{
                      maxHeight: initialMode === "add" ? 540 : 0,
                      transition: `max-height ${initialMode === "add" ? 260 : 220}ms ${EASING}`
                    }}
                  >
                    <div
                      className={clsx(
                        "space-y-3 pt-2",
                        initialMode === "add"
                          ? "opacity-100 translate-y-0"
                          : "pointer-events-none translate-y-[6px] opacity-0"
                      )}
                      style={{
                        transition: `opacity 200ms ${EASING} ${initialMode === "add" ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
                          initialMode === "add" ? "50ms" : "0ms"
                        }`
                      }}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        {[5000, 10000, 25000, 50000].map((amount) => {
                          const isSelected = draft.initialDeposit === amount;
                          return (
                            <button
                              key={amount}
                              type="button"
                              className={clsx(
                                "flex h-16 items-center justify-center rounded-xl border bg-white text-base font-semibold text-slate-800 shadow-subtle transition",
                                isSelected ? "border-slate-500 shadow-md" : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                              )}
                              style={{ transitionTimingFunction: EASING, transitionDuration: "140ms" }}
                              onClick={() => {
                                setSavedInitialDeposit(amount);
                                updateField("initialDeposit", amount);
                                setShowCustomInitial(false);
                              }}
                            >
                              ${amount.toLocaleString()}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="px-0 text-slate-800"
                          onClick={() => setShowCustomInitial((prev) => !prev)}
                        >
                          Custom amount
                        </Button>

                        <div
                          className="overflow-hidden"
                          style={{
                            maxHeight: showCustomInitial ? 160 : 0,
                            transition: `max-height ${showCustomInitial ? 240 : 200}ms ${EASING}`
                          }}
                        >
                          <div
                            className={clsx(
                              "rounded-xl border border-slate-200 bg-white/70 p-3", 
                              showCustomInitial
                                ? "opacity-100 translate-y-0"
                                : "pointer-events-none translate-y-[6px] opacity-0"
                            )}
                            style={{
                              transition: `opacity 200ms ${EASING} ${showCustomInitial ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
                                showCustomInitial ? "50ms" : "0ms"
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
                                value={draft.initialDeposit}
                                onChange={(e) => {
                                  const sanitized = Math.max(0, Number(e.target.value));
                                  setSavedInitialDeposit(sanitized);
                                  updateField("initialDeposit", sanitized);
                                }}
                                className="pl-7"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
