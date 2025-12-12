"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/utils/downloadCsv";
import { ProjectionResult } from "@/lib/calculations/calculateProjection";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface ExportButtonProps {
  data: ProjectionResult;
  onExportPdf: () => void;
}

export function ExportButton({ data, onExportPdf }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    if (!open) return;

    const handleClickAway = (event: MouseEvent) => {
      if (!triggerRef.current) return;
      if (!triggerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [open]);

  const handleCsv = () => {
    downloadCsv("projection.csv", rows);
    setOpen(false);
  };

  const handlePdf = () => {
    setOpen(false);
    onExportPdf();
  };

  return (
    <div className="relative print:hidden">
      <Button
        ref={triggerRef}
        variant="outline"
        className="gap-2"
        onClick={handlePdf}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="export-menu"
      >
        Export
        <span
          className="ml-1 flex h-5 w-5 items-center justify-center rounded-md text-slate-500 hover:text-slate-700"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((p) => !p);
          }}
          aria-label="Toggle export options"
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen((p) => !p);
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </Button>

      {open && (
        <div
          id="export-menu"
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <div className="p-1 text-left">
            <button
              type="button"
              className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
              onClick={handlePdf}
              role="menuitem"
            >
              <div className="flex-1">
                <p className="font-medium">Export PDF</p>
                <p className="text-xs text-slate-500">Recommended for sharing</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                Recommended
              </span>
            </button>

            <button
              type="button"
              className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
              onClick={handleCsv}
              role="menuitem"
            >
              <div className="flex-1">
                <p className="font-medium">Export CSV</p>
                <p className="text-xs text-slate-500">Data-friendly format</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                Data
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
