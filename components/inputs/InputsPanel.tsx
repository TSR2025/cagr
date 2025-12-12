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

        <div className="space-y-3">
          <SectionHeader title="Time Horizon" />
          <HorizonRow
            label="Contribute for (years)"
            options={CONTRIBUTE_YEAR_OPTIONS}
            selected={draft.recurringYears}
            onSelect={(value) => updateField("recurringYears", value)}
          />
          <HorizonRow
            label="Project over (years)"
            options={PROJECT_YEAR_OPTIONS}
            selected={draft.projectionYears}
            onSelect={(value) => updateField("projectionYears", value)}
          />
          <TimelineVisualization
            contributeYears={draft.recurringYears}
            projectYears={draft.projectionYears}
          />
        </div>

        <OneTimeBoostsSection
          boosts={boostValues}
          onChange={(next) => updateField("boosts", next as OneTimeBoost[])}
          maxYear={draft.projectionYears}
        />
      </CardContent>
    </Card>
  );
}

interface HorizonRowProps {
  label: string;
  options: number[];
  selected: number;
  onSelect: (value: number) => void;
}

function HorizonRow({ label, options, selected, onSelect }: HorizonRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-slate-600">{label}</Label>
      </div>
      <div className="flex gap-2" role="group" aria-label={label}>
        {options.map((option) => {
          const isSelected = option === selected;

          return (
            <Button
              key={option}
              type="button"
              variant={isSelected ? "secondary" : "outline"}
              className="flex-1"
              aria-pressed={isSelected}
              onClick={() => onSelect(option)}
            >
              {option}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

interface TimelineVisualizationProps {
  contributeYears: number;
  projectYears: number;
}

function TimelineVisualization({ contributeYears, projectYears }: TimelineVisualizationProps) {
  const [showLabel, setShowLabel] = useState(false);
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxProjectYears = Math.max(...PROJECT_YEAR_OPTIONS);
  const containerPercent = (projectYears / maxProjectYears) * 100;
  const fillPercent =
    projectYears === 0 ? 0 : Math.min((contributeYears / projectYears) * 100, 100);
  const postContributionYears = Math.max(projectYears - contributeYears, 0);
  const showWarning = projectYears < contributeYears;

  const revealLabel = () => setShowLabel(true);
  const hideLabel = () => setShowLabel(false);

  const handleTouchStart = () => {
    revealLabel();
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }
    touchTimeoutRef.current = setTimeout(() => setShowLabel(false), 1500);
  };

  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex justify-start">
        <div
          tabIndex={0}
          className="group relative transition-[width] duration-300 ease-out focus:outline-none"
          style={{ width: `${containerPercent}%` }}
          onMouseEnter={revealLabel}
          onMouseLeave={hideLabel}
          onFocus={revealLabel}
          onBlur={hideLabel}
          onTouchStart={handleTouchStart}
        >
          <div className="relative h-3 overflow-hidden rounded-full bg-slate-200/90">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400 transition-[width] duration-200 ease-out"
              style={{ width: `${fillPercent}%` }}
            />
          </div>
          {showLabel && (
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[120%] rounded-full bg-white/95 px-2 py-0.5 text-xs font-medium text-slate-700 shadow-subtle">
              {contributeYears} yrs contributing • {postContributionYears} yrs growing
            </div>
          )}
        </div>
      </div>
      {showWarning && (
        <p className="text-xs text-amber-600">
          Projection horizon is shorter than the contribution period. Calculations will still run.
        </p>
      )}
    </div>
  );
}
