"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateProjection,
  Inputs,
  OneTimeBoost
} from "@/lib/calculations/calculateProjection";
import { InputsPanel } from "@/components/inputs/InputsPanel";
import { ResultsPanel } from "@/components/results/ResultsPanel";

const defaultInputs: Inputs = {
  initialDeposit: 10000,
  recurringAmount: 750,
  contributeYears: 20,
  projectYears: 30,
  interestRate: 7,
  boosts: []
};

export default function HomePage() {
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("print") === "1") {
      setPrintMode(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (printMode) {
      const url = new URL(window.location.href);
      url.searchParams.set("print", "1");
      window.history.replaceState(null, "", url.toString());
      document.body.classList.add("print-mode");

      const handleAfterPrint = () => setPrintMode(false);
      window.addEventListener("afterprint", handleAfterPrint);

      const timer = window.setTimeout(() => {
        window.print();
      }, 50);

      return () => {
        document.body.classList.remove("print-mode");
        window.removeEventListener("afterprint", handleAfterPrint);
        window.clearTimeout(timer);
      };
    }

    const cleanedUrl = new URL(window.location.href);
    if (cleanedUrl.searchParams.has("print")) {
      cleanedUrl.searchParams.delete("print");
      window.history.replaceState(null, "", cleanedUrl.toString());
    }
    document.body.classList.remove("print-mode");
  }, [printMode]);

  const handleExportPdf = useCallback(() => {
    setPrintMode(true);
  }, []);

  const projection = useMemo(() => calculateProjection(inputs), [inputs]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 lg:py-12 print:max-w-none print:bg-white print:px-8 print:py-6">
      <div className="grid gap-6 lg:grid-cols-[400px_1fr] print:grid-cols-1">
        <div className="order-2 lg:order-1 print:hidden">
          <InputsPanel inputs={inputs} onChange={setInputs} />
        </div>
        <div className="order-1 lg:order-2">
          <ResultsPanel data={projection} onExportPdf={handleExportPdf} printMode={printMode} />
        </div>
      </div>
    </main>
  );
}
