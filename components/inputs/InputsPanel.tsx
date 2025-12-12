"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NumericField } from "./NumericField";
import { SelectField } from "./SelectField";
import { SectionHeader } from "./SectionHeader";
import { OneTimeBoostsSection } from "./OneTimeBoostsSection";
import {
  Inputs,
  OneTimeBoost,
  ContributionFrequency,
  Compounding
} from "@/lib/calculations/calculateProjection";

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
          <NumericField
            id="interestRate"
            label="Annual Interest Rate (%)"
            value={draft.interestRate}
            step={0.1}
            onChange={(val) => updateField("interestRate", val)}
            tooltip="Average annual return you expect to earn."
          />
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
          <NumericField
            id="recurringAmount"
            label="Contribution Amount"
            prefix="$"
            value={draft.recurringAmount}
            onChange={(val) => updateField("recurringAmount", val)}
          />
          <SelectField
            id="recurringFrequency"
            label="Contribution Frequency"
            value={draft.recurringFrequency}
            onValueChange={(val) => updateField("recurringFrequency", val as ContributionFrequency)}
            options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]}
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
