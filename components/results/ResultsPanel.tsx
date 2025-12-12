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
  onExportPdf: () => void;
  printMode?: boolean;
}

export function ResultsPanel({ data, onExportPdf, printMode = false }: ResultsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between print:mb-2">
        <div>
          <p className="text-sm text-slate-500">Results</p>
          <h2 className="text-xl font-semibold text-slate-900">Your forecast</h2>
        </div>
        {!printMode && <ExportButton data={data} onExportPdf={onExportPdf} />}
      </div>

      <SummaryStats data={data} />
      <GrowthChart data={data} />
      <MilestoneTable data={data} />

      {!printMode && (
        <div className="space-y-3 print:hidden">
          <ExpandToggle expanded={expanded} onToggle={() => setExpanded((p) => !p)} />
          {expanded && <FullBreakdownTable data={data} />}
        </div>
      )}
    </div>
  );
}
