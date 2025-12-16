"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateProjection,
  Inputs
} from "@/lib/calculations/calculateProjection";
import { InputsPanel } from "@/components/inputs/InputsPanel";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { MIN_AGE, MIN_CONTRIB_WINDOW_YEARS, SNAP_INCREMENT_YEARS } from "@/lib/timeModel";
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

export default function HomePage() {
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [isTimeCalibrated, setIsTimeCalibrated] = useState(false);
  const [timePulseSignal, setTimePulseSignal] = useState(0);

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

  const handleTimeInteraction = useCallback(() => {
    markTimeCalibrated();
    setTimePulseSignal((prev) => prev + 1);
  }, [markTimeCalibrated]);

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
      <div className="grid gap-6 lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr]">
        <div className="order-2 lg:order-1">
          <InputsPanel inputs={inputs} onChange={setInputs} />
        </div>
        <div className="order-1 lg:order-2 space-y-6">
          <ResultsPanel
            data={projection}
            isTimeCalibrated={isTimeCalibrated}
            timePulseSignal={timePulseSignal}
            timeControls={{
              startingAge: inputs.startingAge,
              onStartingAgeChange: handleStartingAgeChange,
              stopContributingAge: inputs.contributionEndAge,
              onStopContributingAgeChange: handleContributionEndChange,
              minAge: MIN_AGE,
              maxAge: projection.projectionEndAge,
              minWindowYears: MIN_CONTRIB_WINDOW_YEARS,
              snapIncrementYears: SNAP_INCREMENT_YEARS
            }}
          />
        </div>
      </div>
    </main>
  );
}
