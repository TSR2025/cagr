"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/utils/downloadCsv";
import { ProjectionResult } from "@/lib/calculations/calculateProjection";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface ExportButtonProps {
  data: ProjectionResult;
}

export function ExportButton({ data }: ExportButtonProps) {
  const rows = useMemo(() => {
    const header = ["Year", "Balance", "Total Contributions", "Total Interest"];
    const body = data.yearly.map((year) => [
      year.year.toString(),
      formatCurrency(year.balance),
      formatCurrency(year.totalContributions),
      formatCurrency(year.totalInterest)
    ]);
    const summary = [
      [],
      ["Final Balance", formatCurrency(data.finalBalance)],
      ["Total Contributions", formatCurrency(data.totalContributions)],
      ["Total Interest", formatCurrency(data.totalInterest)]
    ];
    return [header, ...body, ...summary];
  }, [data]);

  return (
    <Button variant="ghost" onClick={() => downloadCsv("projection.csv", rows)}>
      Export
    </Button>
  );
}
