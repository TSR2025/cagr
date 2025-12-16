"use client";

import { useState } from "react";
import { ProjectionResult } from "@/lib/calculations/calculateProjection";
import { ChartGate } from "../ChartGate";
import { ExportButton } from "./ExportButton";
import { GrowthChart } from "./GrowthChart";
import { MilestoneTable } from "./MilestoneTable";
import { FullBreakdownTable } from "./FullBreakdownTable";
import { ExpandToggle } from "./ExpandToggle";
import { OptionsStrip } from "./OptionsStrip";
import { TimeControls } from "../TimeControls";

interface TimeControlConfig {
  startingAge: number;
  onStartingAgeChange: (next: number) => void;
  stopContributingAge: number;
  onStopContributingAgeChange: (next: number) => void;
  minAge: number;
  maxAge: number;
  minWindowYears: number;
  snapIncrementYears: number;
}

interface ResultsPanelProps {
  data: ProjectionResult;
  isTimeCalibrated: boolean;
  timePulseSignal: number;
  timeControls: TimeControlConfig;
}

export function ResultsPanel({
  data,
  isTimeCalibrated,
  timePulseSignal,
  timeControls
}: ResultsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Results</p>
          <h2 className="text-xl font-semibold text-slate-900">Your forecast</h2>
        </div>
        <ExportButton data={data} />
      </div>

      <div className="space-y-5 border-b border-slate-200/80 pb-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1fr)] lg:items-start lg:gap-5">
          <TimeControls {...timeControls} className="lg:max-w-xl" />
          <OptionsStrip data={data} />
        </div>
      </div>
      <ChartGate isLocked={!isTimeCalibrated}>
        <GrowthChart data={data} timePulseSignal={timePulseSignal} />
      </ChartGate>
      <MilestoneTable data={data} />

      <div className="space-y-3">
        <ExpandToggle expanded={expanded} onToggle={() => setExpanded((p) => !p)} />
        {expanded && <FullBreakdownTable data={data} />}
      </div>
    </div>
  );
}
