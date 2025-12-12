"use client";

import { useMemo, useState } from "react";
import {
  calculateProjection,
  Inputs,
  Compounding,
  OneTimeBoost
} from "@/lib/calculations/calculateProjection";
import { InputsPanel } from "@/components/inputs/InputsPanel";
import { ResultsPanel } from "@/components/results/ResultsPanel";

const defaultInputs: Inputs = {
  initialDeposit: 10000,
  recurringAmount: 750,
  recurringYears: 20,
  projectionYears: 30,
  interestRate: 7,
  compounding: "monthly",
  boosts: [{ year: 5, amount: 5000, label: "Bonus" }]
};

export default function HomePage() {
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);

  const projection = useMemo(() => calculateProjection(inputs), [inputs]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="order-2 lg:order-1">
          <InputsPanel inputs={inputs} onChange={setInputs} />
        </div>
        <div className="order-1 lg:order-2">
          <ResultsPanel data={projection} inputs={inputs} />
        </div>
      </div>
    </main>
  );
}
