"use client";

import { useState } from "react";
import { ProjectionResult } from "@/lib/calculations/calculateProjection";
import { ExportButton } from "./ExportButton";
import { SummaryStats } from "./SummaryStats";
import { GrowthChart } from "./GrowthChart";
import { MilestoneTable } from "./MilestoneTable";
import { FullBreakdownTable } from "./FullBreakdownTable";
import { ExpandToggle } from "./ExpandToggle";

interface ResultsPanelProps {
  data: ProjectionResult;
  currentAge: number;
}

export function ResultsPanel({ data, currentAge }: ResultsPanelProps) {
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
      <GrowthChart data={data} currentAge={currentAge} />
      <MilestoneTable data={data} currentAge={currentAge} />

      <div className="space-y-3">
        <ExpandToggle expanded={expanded} onToggle={() => setExpanded((p) => !p)} />
        {expanded && <FullBreakdownTable data={data} />}
      </div>
    </div>
  );
}
