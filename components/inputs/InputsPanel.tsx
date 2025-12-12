"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NumericField } from "./NumericField";
import { SectionHeader } from "./SectionHeader";
import { OneTimeBoostsSection } from "./OneTimeBoostsSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Inputs,
  OneTimeBoost
} from "@/lib/calculations/calculateProjection";
import { ContributionSelector } from "./ContributionSelector";
import { TooltipIcon } from "./TooltipIcon";

const INTEREST_RATE_OPTIONS = [3, 5, 7, 10];
const CONTRIBUTE_YEAR_OPTIONS = [10, 20, 30];
const PROJECT_YEAR_OPTIONS = [20, 30, 40];

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

  const boostValues = useMemo(() => draft.boosts || [], [draft.boosts]);

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
        <div className="space-y-3">
          <SectionHeader title="Starting Point" />
          <NumericField
            id="initialDeposit"
            label="Initial Lump Sum"
            prefix="$"
            value={draft.initialDeposit}
            onChange={(val) => updateField("initialDeposit", val)}
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

        <div className="space-y-3">
          <SectionHeader title="Recurring Contributions" />
          <ContributionSelector
            value={draft.recurringAmount}
            onChange={(val) => updateField("recurringAmount", val)}
            tooltip="Your planned monthly contribution."
          />
        </div>

        <div className="space-y-4">
          <SectionHeader title="Time Horizon" />
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-600">Contribute for (years)</Label>
            <div className="flex gap-2" role="group" aria-label="Contribute for years">
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
            <Label className="text-sm font-medium text-slate-600">Project over (years)</Label>
            <div className="flex gap-2" role="group" aria-label="Project over years">
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

          <TimeHorizonTimeline contributeYears={draft.contributeYears} projectYears={draft.projectYears} />
        </div>

        <OneTimeBoostsSection
          boosts={boostValues}
          onChange={(next) => updateField("boosts", next as OneTimeBoost[])}
          maxYear={draft.projectYears}
        />
      </CardContent>
    </Card>
  );
}

interface TimeHorizonTimelineProps {
  contributeYears: number;
  projectYears: number;
}

function TimeHorizonTimeline({ contributeYears, projectYears }: TimeHorizonTimelineProps) {
  const [showLabel, setShowLabel] = useState(false);
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  const maxProjectYears = Math.max(...PROJECT_YEAR_OPTIONS);
  const safeProjectYears = Math.max(projectYears, 0);
  const postContributionYears = Math.max(projectYears - contributeYears, 0);
  const containerWidth = `${(Math.min(safeProjectYears, maxProjectYears) / maxProjectYears) * 100}%`;
  const contributionShare = safeProjectYears === 0 ? 0 : Math.min(contributeYears / safeProjectYears, 1);
  const fillWidth = `${contributionShare * 100}%`;
  const showWarning = projectYears < contributeYears;

  const labelText = `${contributeYears} yrs contributing • ${postContributionYears} yrs growing`;

  const triggerTouchLabel = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }

    setShowLabel(true);
    touchTimeoutRef.current = setTimeout(() => setShowLabel(false), 1600);
  };

  const hideTouchLabel = () => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }

    setShowLabel(false);
  };

  return (
    <div className="space-y-2">
      <div
        className="group w-full space-y-2"
        tabIndex={0}
        role="presentation"
        onTouchStart={triggerTouchLabel}
        onMouseLeave={hideTouchLabel}
        onBlur={hideTouchLabel}
      >
        <div
          className="relative h-3 rounded-full bg-slate-100 transition-[width] duration-300 ease-out"
          style={{ width: containerWidth }}
        >
          <div
            className="h-full rounded-full bg-indigo-500 transition-[width] duration-300 ease-out"
            style={{ width: fillWidth }}
          />
        </div>
        <p
          className="text-xs text-slate-600 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 data-[visible=true]:opacity-100"
          data-visible={showLabel}
        >
          {labelText}
        </p>
      </div>
      {showWarning && (
        <p className="text-xs text-amber-600">Project duration is shorter than contribution period.</p>
      )}
    </div>
  );
}
