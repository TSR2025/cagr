"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NumericField } from "./NumericField";
import { SectionHeader } from "./SectionHeader";
import { OneTimeBoostsSection } from "./OneTimeBoostsSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import {
  Inputs,
  OneTimeBoost
} from "@/lib/calculations/calculateProjection";
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
  const hasActiveBoosts = useMemo(
    () => (draft.boosts || []).some((boost) => boost.amount > 0 && boost.year > 0),
    [draft.boosts]
  );
  const [scenariosOpen, setScenariosOpen] = useState(false);
  const [initialInvestmentEnabled, setInitialInvestmentEnabled] = useState(inputs.initialDeposit > 0);
  const [boostsEnabled, setBoostsEnabled] = useState(hasActiveBoosts);
  const [initialDepositCache, setInitialDepositCache] = useState(() => Math.max(inputs.initialDeposit || 0, 5000));
  const [boostsCache, setBoostsCache] = useState<OneTimeBoost[]>(inputs.boosts || []);
  const [showCustomInitial, setShowCustomInitial] = useState(
    () => inputs.initialDeposit > 0 && !INITIAL_PRESET_OPTIONS.includes(inputs.initialDeposit)
  );

  useEffect(() => {
    const id = setTimeout(() => onChange(draft), 250);
    return () => clearTimeout(id);
  }, [draft, onChange]);

  useEffect(() => {
    setDraft(inputs);
    setInitialInvestmentEnabled(inputs.initialDeposit > 0);
    setBoostsEnabled((inputs.boosts || []).some((boost) => boost.amount > 0 && boost.year > 0));
    setInitialDepositCache(Math.max(inputs.initialDeposit || 0, 5000));
    setBoostsCache(inputs.boosts || []);
    setShowCustomInitial(
      inputs.initialDeposit > 0 && !INITIAL_PRESET_OPTIONS.includes(inputs.initialDeposit)
    );
  }, [inputs]);

  const updateField = <K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const boostValues = useMemo(() => draft.boosts || [], [draft.boosts]);
  const showDurationWarning = draft.projectYears < draft.contributeYears;

  useEffect(() => {
    if (draft.initialDeposit > 0 && !INITIAL_PRESET_OPTIONS.includes(draft.initialDeposit)) {
      setShowCustomInitial(true);
    }
  }, [draft.initialDeposit]);

  const handleInitialDepositChange = (value: number) => {
    const sanitized = Math.max(0, value);
    setInitialDepositCache((prev) => (sanitized > 0 ? sanitized : prev || 5000));
    updateField("initialDeposit", sanitized);
    if (!initialInvestmentEnabled && sanitized > 0) {
      setInitialInvestmentEnabled(true);
    }
  };

  const handleInitialInvestmentToggle = (enabled: boolean) => {
    setInitialInvestmentEnabled(enabled);
    if (enabled) {
      const nextValue = initialDepositCache > 0 ? initialDepositCache : 5000;
      updateField("initialDeposit", nextValue);
      setScenariosOpen(true);
    } else {
      setInitialDepositCache((prev) => (draft.initialDeposit > 0 ? draft.initialDeposit : prev));
      updateField("initialDeposit", 0 as Inputs["initialDeposit"]);
    }
  };

  const handleBoostsToggle = (enabled: boolean) => {
    setBoostsEnabled(enabled);
    if (enabled) {
      const nextBoosts = boostsCache.length ? boostsCache : draft.boosts || [{ year: 1, amount: 0, label: "" }];
      updateField("boosts", nextBoosts as Inputs["boosts"]);
      setScenariosOpen(true);
    } else {
      setBoostsCache(boostValues);
      updateField("boosts", [] as Inputs["boosts"]);
    }
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
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setScenariosOpen((prev) => !prev)}
              aria-expanded={scenariosOpen}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-slate-800"
            >
              <span className="text-sm font-semibold">+ Add scenarios (optional)</span>
              <ChevronDown
                className="h-4 w-4 text-slate-500 transition-transform"
                style={{
                  transform: `rotate(${scenariosOpen ? 180 : 0}deg)`,
                  transitionTimingFunction: EASING,
                  transitionDuration: "200ms"
                }}
              />
            </Button>
          </div>

          <div
            className="overflow-hidden"
            style={{
              maxHeight: scenariosOpen ? 1200 : 0,
              transition: `max-height ${scenariosOpen ? 300 : 240}ms ${EASING}`
            }}
          >
            <div
              className={clsx(
                "space-y-5 rounded-2xl border border-slate-200/80 bg-white/60 p-4 shadow-sm",
                scenariosOpen
                  ? "opacity-100 translate-y-0"
                  : "pointer-events-none translate-y-[6px] opacity-0"
              )}
              style={{
                transition: `opacity 200ms ${EASING} ${scenariosOpen ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
                  scenariosOpen ? "50ms" : "0ms"
                }`
              }}
            >
              <InitialInvestmentSection
                enabled={initialInvestmentEnabled}
                onToggle={handleInitialInvestmentToggle}
                value={draft.initialDeposit}
                onChange={handleInitialDepositChange}
                showCustomInput={showCustomInitial}
                onRequestCustom={() => setShowCustomInitial(true)}
              />

              <OneTimeBoostsPanel
                enabled={boostsEnabled}
                onToggle={handleBoostsToggle}
                boosts={boostValues}
                onChange={(next) => updateField("boosts", next as OneTimeBoost[])}
                projectYears={draft.projectYears}
              />
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

const INITIAL_PRESET_OPTIONS = [5000, 10000, 25000, 50000];

interface ToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  labels: [string, string];
}

function TogglePill({ enabled, onToggle, labels }: ToggleProps) {
  return (
    <div className="inline-flex gap-2 rounded-full bg-slate-100 p-1">
      {labels.map((label, index) => {
        const isActive = (enabled && index === 1) || (!enabled && index === 0);
        return (
          <Button
            key={label}
            type="button"
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            className="px-3"
            onClick={() => onToggle(index === 1)}
            aria-pressed={isActive}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}

interface InitialInvestmentSectionProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  value: number;
  onChange: (value: number) => void;
  showCustomInput: boolean;
  onRequestCustom: () => void;
}

function InitialInvestmentSection({
  enabled,
  onToggle,
  value,
  onChange,
  showCustomInput,
  onRequestCustom
}: InitialInvestmentSectionProps) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-slate-900">Initial investment</p>
        </div>
        <TogglePill enabled={enabled} onToggle={onToggle} labels={["None", "Add initial investment"]} />
      </div>

      <div
        className="overflow-hidden"
        style={{
          maxHeight: enabled ? 600 : 0,
          transition: `max-height ${enabled ? 260 : 220}ms ${EASING}`
        }}
      >
        <div
          className={clsx(
            "space-y-3 pt-2",
            enabled ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-[6px] opacity-0"
          )}
          style={{
            transition: `opacity 200ms ${EASING} ${enabled ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
              enabled ? "50ms" : "0ms"
            }`
          }}
        >
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Initial investment amount">
            {INITIAL_PRESET_OPTIONS.map((amount) => {
              const isSelected = value === amount;
              return (
                <button
                  key={amount}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={clsx(
                    "flex h-14 items-center justify-center rounded-lg border bg-slate-50 text-base font-semibold text-slate-800 shadow-subtle transition-all duration-150",
                    "hover:border-slate-300 hover:shadow-md",
                    isSelected && "border-slate-500 bg-white shadow-md"
                  )}
                  style={{
                    transitionTimingFunction: EASING
                  }}
                  onClick={() => onChange(amount)}
                >
                  ${amount.toLocaleString()}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {!showCustomInput && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="px-2 text-slate-700"
                onClick={onRequestCustom}
              >
                Custom amount
              </Button>
            )}
            <div
              className={clsx(
                "overflow-hidden transition-[max-height]",
                showCustomInput ? "max-h-24" : "max-h-0"
              )}
              style={{
                transitionDuration: `${showCustomInput ? 240 : 200}ms`,
                transitionTimingFunction: EASING
              }}
            >
              <div className={clsx(showCustomInput ? "opacity-100" : "opacity-0", "transition-opacity duration-200")}> 
                <NumericField
                  id="initialDeposit"
                  label="Custom initial amount"
                  prefix="$"
                  value={value}
                  onChange={(val) => onChange(Math.max(0, val))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface OneTimeBoostsPanelProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  boosts: OneTimeBoost[];
  onChange: (boosts: OneTimeBoost[]) => void;
  projectYears: number;
}

function OneTimeBoostsPanel({ enabled, onToggle, boosts, onChange, projectYears }: OneTimeBoostsPanelProps) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200/80 bg-white/80 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">One-time boosts</p>
          <p className="text-xs text-slate-600">Add occasional amounts like bonuses or windfalls.</p>
        </div>
        <TogglePill enabled={enabled} onToggle={onToggle} labels={["None", "Add boosts"]} />
      </div>

      <div
        className="overflow-hidden"
        style={{
          maxHeight: enabled ? 900 : 0,
          transition: `max-height ${enabled ? 260 : 220}ms ${EASING}`
        }}
      >
        <div
          className={clsx(
            "space-y-3 pt-2",
            enabled ? "opacity-100 translate-y-0" : "pointer-events-none translate-y-[6px] opacity-0"
          )}
          style={{
            transition: `opacity 200ms ${EASING} ${enabled ? "50ms" : "0ms"}, transform 220ms ${EASING} ${
              enabled ? "50ms" : "0ms"
            }`
          }}
        >
          <OneTimeBoostsSection
            boosts={boosts}
            onChange={onChange}
            maxYear={projectYears}
            showHeader={false}
          />
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
