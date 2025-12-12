"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NumericField } from "./NumericField";
import { SelectField } from "./SelectField";
import { SectionHeader } from "./SectionHeader";
import { OneTimeBoostsSection } from "./OneTimeBoostsSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Inputs,
  OneTimeBoost,
  Compounding
} from "@/lib/calculations/calculateProjection";
import { ContributionSelector } from "./ContributionSelector";
import { TooltipIcon } from "./TooltipIcon";

const INTEREST_RATE_OPTIONS = [3, 5, 7, 10];

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

  const ensureProjection = (value: number) => {
    const nextProjection = Math.max(value, draft.recurringYears);
    updateField("projectionYears", nextProjection);
  };

  return (
    <Card className="sticky top-6 h-fit w-full max-w-[420px] border-slate-200 bg-white/90 shadow-subtle">
      <CardHeader className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-slate-500">Inputs</p>
        <h2 className="text-xl font-semibold text-slate-900">Plan your growth</h2>
        <p className="text-sm text-slate-600">
          Adjust the knobs to see how recurring contributions, boosts, and compounding shape your balance.
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
              <TooltipIcon text="Average annual return you expect to earn." />
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
          <SelectField
            id="compounding"
            label="Compounding Frequency"
            value={draft.compounding}
            onValueChange={(val) => updateField("compounding", val as Compounding)}
            options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]}
            tooltip="How often interest is added to your balance."
          />
        </div>

        <div className="space-y-3">
          <SectionHeader title="Recurring Contributions" />
          <ContributionSelector
            value={draft.recurringAmount}
            onChange={(val) => updateField("recurringAmount", val)}
            tooltip="Your planned monthly contribution."
          />
          <NumericField
            id="recurringYears"
            label="Contribute For (years)"
            value={draft.recurringYears}
            min={1}
            onChange={(val) => {
              updateField("recurringYears", val);
              if (val > draft.projectionYears) {
                updateField("projectionYears", val);
              }
            }}
            tooltip="How long you plan to keep contributing (in years)."
          />
        </div>

        <div className="space-y-3">
          <SectionHeader title="Projection" />
          <NumericField
            id="projectionYears"
            label="Project Over (years)"
            value={draft.projectionYears}
            min={draft.recurringYears}
            onChange={(val) => ensureProjection(val)}
            tooltip="How long we should show your money growing (overall horizon)."
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
