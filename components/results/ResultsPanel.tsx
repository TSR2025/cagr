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

interface ResultsPanelProps {
  data: ProjectionResult;
  isTimeCalibrated: boolean;
  timePulseSignal: number;
}

export function ResultsPanel({
  data,
  isTimeCalibrated,
  timePulseSignal
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

      <OptionsStrip data={data} />
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
