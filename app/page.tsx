"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateProjection,
  Inputs
} from "@/lib/calculations/calculateProjection";
import { InputsPanel } from "@/components/inputs/InputsPanel";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { normalizeTimeModel } from "@/lib/timeModel";

const defaultInputs: Inputs = {
  initialDeposit: 10000,
  recurringAmount: 750,
  interestRate: 7,
  startingAge: 30,
  contributionEndAge: 60,
  boosts: []
};

const TIME_CALIBRATION_KEY = "horizon_time_calibrated";
const TIME_INSIGHT_KEY = "horizon_time_insight_shown";

export default function HomePage() {
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [isTimeCalibrated, setIsTimeCalibrated] = useState(false);
  const [hasShownTimeInsight, setHasShownTimeInsight] = useState(false);
  const [insightTrigger, setInsightTrigger] = useState(0);
  const [timePulseSignal, setTimePulseSignal] = useState(0);

  const projection = useMemo(() => calculateProjection(inputs), [inputs]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(TIME_CALIBRATION_KEY);
      if (stored === "true") {
        setIsTimeCalibrated(true);
      }
      const insightStored = sessionStorage.getItem(TIME_INSIGHT_KEY);
      if (insightStored === "true") {
        setHasShownTimeInsight(true);
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

  const markInsightShown = useCallback(() => {
    setHasShownTimeInsight(true);
    try {
      sessionStorage.setItem(TIME_INSIGHT_KEY, "true");
    } catch (error) {
      console.error("Failed to persist time insight state", error);
    }
  }, []);

  const handleTimeInteraction = useCallback(() => {
    markTimeCalibrated();
    setTimePulseSignal((prev) => prev + 1);

    setInsightTrigger((prev) => {
      if (hasShownTimeInsight) return prev;
      return prev + 1;
    });
  }, [hasShownTimeInsight, markTimeCalibrated]);

  const handleStartingAgeChange = useCallback((nextAge: number) => {
    handleTimeInteraction();
    setInputs((prev) => {
      const normalized = normalizeTimeModel(nextAge, prev.contributionEndAge);
      return { ...prev, startingAge: normalized.startingAge, contributionEndAge: normalized.contributionEndAge };
    });
  }, [handleTimeInteraction]);

  const handleContributionEndChange = useCallback((nextEndAge: number) => {
    handleTimeInteraction();
    setInputs((prev) => {
      const normalized = normalizeTimeModel(prev.startingAge, nextEndAge);
      return { ...prev, startingAge: normalized.startingAge, contributionEndAge: normalized.contributionEndAge };
    });
  }, [handleTimeInteraction]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="order-2 lg:order-1">
          <InputsPanel inputs={inputs} onChange={setInputs} />
        </div>
        <div className="order-1 lg:order-2">
          <ResultsPanel
            data={projection}
            onStartingAgeChange={handleStartingAgeChange}
            onContributionEndAgeChange={handleContributionEndChange}
            isTimeCalibrated={isTimeCalibrated}
            hasShownTimeInsight={hasShownTimeInsight}
            insightTrigger={insightTrigger}
            onInsightComplete={markInsightShown}
            timePulseSignal={timePulseSignal}
          />
        </div>
      </div>
    </main>
  );
}
