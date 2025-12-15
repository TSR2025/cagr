"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateProjection,
  Inputs
} from "@/lib/calculations/calculateProjection";
import { InputsPanel } from "@/components/inputs/InputsPanel";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { DEFAULT_CURRENT_AGE } from "@/lib/utils/sanitizeAge";

const defaultInputs: Inputs = {
  initialDeposit: 10000,
  recurringAmount: 750,
  contributeYears: 20,
  projectYears: 30,
  interestRate: 7,
  currentAge: DEFAULT_CURRENT_AGE,
  boosts: []
};

const TIME_CALIBRATION_KEY = "horizon_time_calibrated";

export default function HomePage() {
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [isTimeCalibrated, setIsTimeCalibrated] = useState(false);

  const projection = useMemo(() => calculateProjection(inputs), [inputs]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(TIME_CALIBRATION_KEY);
      if (stored === "true") {
        setIsTimeCalibrated(true);
      }
    } catch (error) {
      console.error("Failed to read time calibration state", error);
    }
  }, []);

  const markTimeCalibrated = useCallback(() => {
    setIsTimeCalibrated((prev) => {
      if (prev) return prev;

      try {
        sessionStorage.setItem(TIME_CALIBRATION_KEY, "true");
      } catch (error) {
        console.error("Failed to persist time calibration state", error);
      }

      return true;
    });
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="order-2 lg:order-1">
          <InputsPanel inputs={inputs} onChange={setInputs} onTimeCalibrated={markTimeCalibrated} />
        </div>
        <div className="order-1 lg:order-2">
          <ResultsPanel data={projection} currentAge={inputs.currentAge} isTimeCalibrated={isTimeCalibrated} />
        </div>
      </div>
    </main>
  );
}
