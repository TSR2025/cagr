"use client";

import { useState } from "react";
import { ProjectionResult } from "@/lib/calculations/calculateProjection";
import { ChartGate } from "../ChartGate";
import { ExportButton } from "./ExportButton";
import { SummaryStats } from "./SummaryStats";
import { GrowthChart } from "./GrowthChart";
import { MilestoneTable } from "./MilestoneTable";
import { FullBreakdownTable } from "./FullBreakdownTable";
import { ExpandToggle } from "./ExpandToggle";

interface ResultsPanelProps {
  data: ProjectionResult;
  isTimeCalibrated: boolean;
  hasShownTimeInsight: boolean;
  insightTrigger: number;
  onInsightComplete: () => void;
  timePulseSignal: number;
  onStartingAgeChange: (age: number) => void;
  onContributionEndAgeChange: (age: number) => void;
}

export function ResultsPanel({
  data,
  isTimeCalibrated,
  hasShownTimeInsight,
  insightTrigger,
  onInsightComplete,
  timePulseSignal,
  onStartingAgeChange,
  onContributionEndAgeChange
}: ResultsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Results</p>
          <h2 className="text-xl font-semibold text-slate-900">Your forecast</h2>
        </div>
        <ExportButton data={data} />
      </div>

      <SummaryStats data={data} />
      <ChartGate
        isLocked={!isTimeCalibrated}
        insightTrigger={hasShownTimeInsight ? 0 : insightTrigger}
        onInsightComplete={onInsightComplete}
      >
        <GrowthChart
          data={data}
          timePulseSignal={timePulseSignal}
          onStartingAgeChange={onStartingAgeChange}
          onContributionEndAgeChange={onContributionEndAgeChange}
        />
      </ChartGate>
      <MilestoneTable data={data} />

      <div className="space-y-3">
        <ExpandToggle expanded={expanded} onToggle={() => setExpanded((p) => !p)} />
        {expanded && <FullBreakdownTable data={data} />}
      </div>
    </div>
  );
}
