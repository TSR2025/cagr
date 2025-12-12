"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NumericField } from "./NumericField";
import { SectionHeader } from "./SectionHeader";
import { OneTimeBoostsSection } from "./OneTimeBoostsSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { Inputs, OneTimeBoost } from "@/lib/calculations/calculateProjection";
import { ContributionSelector } from "./ContributionSelector";
import { TooltipIcon } from "./TooltipIcon";
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
  const [showBoosts, setShowBoosts] = useState(false);

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

  const boostValues = useMemo(() => draft.boosts || [], [draft.boosts]);
  const showDurationWarning = draft.projectYears < draft.contributeYears;

  return (
    <Card className="sticky top-6 h-fit w-full max-w-[420px] border-slate-200 bg-white/90 shadow-subtle">
      <CardHeader className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-slate-500">Inputs</p>
        <h2 className="text-xl font-semibold text-slate-900">Plan your growth</h2>
        <p className="text-sm text-slate-600">
          Adjust the knobs to see how recurring contributions and boosts shape your balance.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle">
          <SectionHeader
            title="Contributions"
            description="Set your recurring amount first, then layer in up-front and occasional boosts."
          />
          <div className="space-y-4">
            <ContributionSelector
              value={draft.recurringAmount}
              onChange={(val) => updateField("recurringAmount", val)}
              tooltip="Your planned monthly contribution."
            />

            <NumericField
              id="initialDeposit"
              label="Initial Lump Sum"
              prefix="$"
              value={draft.initialDeposit}
              onChange={(val) => updateField("initialDeposit", val)}
              tooltip="Start stronger with an up-front amount."
            />

            <div className="rounded-xl border border-slate-200/90 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setShowBoosts((prev) => !prev)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800"
                aria-expanded={showBoosts}
              >
                <div className="flex items-center gap-2">
                  <span>One-time boosts (optional)</span>
                  <TooltipIcon text="Add occasional windfalls to see how they influence your total growth." />
                </div>
                <ChevronDown
                  className="h-4 w-4 transition-transform"
                  style={{
                    transform: `rotate(${showBoosts ? 180 : 0}deg)`,
                    transitionTimingFunction: EASING,
                    transitionDuration: "200ms"
                  }}
                />
              </button>
              <div
                className="overflow-hidden px-4"
                style={{
                  maxHeight: showBoosts ? 520 : 0,
                  transition: `max-height ${showBoosts ? 300 : 240}ms ${EASING}`
                }}
              >
                <div
                  className={clsx(
                    "pb-4",
                    showBoosts
                      ? "opacity-100 translate-y-0"
                      : "pointer-events-none opacity-0 translate-y-[6px]"
                  )}
                  style={{
                    transition: `opacity 200ms ${EASING} ${showBoosts ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
                      showBoosts ? "50ms" : "0ms"
                    }`
                  }}
                >
                  <p className="mb-3 text-xs text-slate-600">
                    Add large one-time amounts at specific years, like bonuses or a house sale.
                  </p>
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

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_1px_0_rgba(15,23,42,0.05)]">
          <SectionHeader
            title="Time Horizon"
            description="Decide how long you’ll contribute and how far ahead to project."
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

        <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <SectionHeader
            title="Assumptions"
            description="Adjust only if you want to explore different return scenarios."
          />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-slate-600">Annual Interest Rate</Label>
              <TooltipIcon text="Average annual return you expect to earn. Returns are annualized; contributions are applied monthly." />
            </div>
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
