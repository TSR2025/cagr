"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "./SectionHeader";
import { OneTimeBoostsSection } from "./OneTimeBoostsSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { Inputs, OneTimeBoost } from "@/lib/calculations/calculateProjection";
import { ContributionSelector } from "./ContributionSelector";
import { ChevronDown } from "lucide-react";
import { InitialInvestmentSlider } from "./InitialInvestmentSlider";

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
  const [boostMode, setBoostMode] = useState<"none" | "add">(
    (inputs.boosts || []).some((boost) => boost.amount || boost.year || boost.label) ? "add" : "none"
  );
  const [savedBoosts, setSavedBoosts] = useState<OneTimeBoost[]>(inputs.boosts || []);
  const [showBoosts, setShowBoosts] = useState(() => (inputs.boosts || []).some((boost) => boost.amount || boost.year));

  useEffect(() => {
    const id = setTimeout(() => onChange(draft), 250);
    return () => clearTimeout(id);
  }, [draft, onChange]);

  useEffect(() => {
    setDraft(inputs);
  }, [inputs]);

  useEffect(() => {
    const hasBoosts = (inputs.boosts || []).some((boost) => boost.amount || boost.year || boost.label);
    setBoostMode(hasBoosts ? "add" : "none");
    if (hasBoosts) {
      setSavedBoosts(inputs.boosts || []);
    }
    setShowBoosts(hasBoosts);
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
          <InitialInvestmentSlider
            value={draft.initialDeposit}
            onChange={(val) => updateField("initialDeposit", val)}
          />
          <ContributionSelector
            value={draft.recurringAmount}
            onChange={(val) => updateField("recurringAmount", val)}
            label="Recurring contributions"
            tooltip="Your planned monthly contribution."
          />

          <div className="space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">One-time boosts (optional)</p>
                <p className="text-xs text-slate-600">Add occasional amounts like bonuses or windfalls.</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-slate-700"
                onClick={() => setShowBoosts((prev) => !prev)}
                aria-expanded={showBoosts}
              >
                <ChevronDown
                  className="h-4 w-4 transition-transform"
                  style={{
                    transform: `rotate(${showBoosts ? 180 : 0}deg)`,
                    transitionTimingFunction: EASING,
                    transitionDuration: "200ms"
                  }}
                />
                {showBoosts ? "Hide" : "Show"}
              </Button>
            </div>

            <div
              className="overflow-hidden"
              style={{
                maxHeight: showBoosts ? 720 : 0,
                transition: `max-height ${showBoosts ? 300 : 240}ms ${EASING}`
              }}
            >
              <div
                className={clsx(
                  "space-y-3 pt-2",
                  showBoosts ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-[6px] opacity-0"
                )}
                style={{
                  transition: `opacity 200ms ${EASING} ${showBoosts ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
                    showBoosts ? "50ms" : "0ms"
                  }`
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
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

                  <div className="text-xs font-medium text-slate-600">
                    {hasBoostsConfigured ? "Boosts applied" : "No boosts added"}
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
                      transition: `opacity 200ms ${EASING} ${boostMode === "add" ? "50ms" : "0ms"}, transform 220ms ${EASING}${
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
