import { expect, test } from "vitest";

import { calculateProjection, Inputs } from "../lib/calculations/calculateProjection";
import { deriveTimeState } from "../lib/utils/timeModel";

const baseInputs: Inputs = {
  initialDeposit: 10000,
  recurringAmount: 500,
  startingAge: 25,
  contributionEndAge: 27,
  interestRate: 6,
  boosts: [{ year: 3, amount: 2000 }]
};

test("calculates projection with principal only", () => {
  const principalOnly: Inputs = {
    ...baseInputs,
    recurringAmount: 0,
    contributionEndAge: 25,
    boosts: []
  };

  const result = calculateProjection(principalOnly);
  const expectedYears = deriveTimeState(principalOnly.startingAge, principalOnly.contributionEndAge).totalYears;
  const expected = principalOnly.initialDeposit * Math.pow(1 + principalOnly.interestRate / 100, expectedYears);

  expect(result.finalBalance).toBeCloseTo(expected, 2);
  expect(result.totalContributions).toBeCloseTo(principalOnly.initialDeposit);
  expect(result.totalInterest).toBeCloseTo(expected - principalOnly.initialDeposit, 2);
});

test("applies monthly contributions at the start of each month", () => {
  const contributionsOnly: Inputs = {
    ...baseInputs,
    initialDeposit: 0,
    recurringAmount: 100,
    contributionEndAge: 26,
    interestRate: 0,
    boosts: []
  };

  const result = calculateProjection(contributionsOnly);

  expect(result.finalBalance).toBeCloseTo(6000);
  expect(result.totalContributions).toBeCloseTo(6000);
  expect(result.totalInterest).toBeCloseTo(0);
});

test("applies boosts at the start of the boost year", () => {
  const inputsWithBoost: Inputs = {
    ...baseInputs,
    initialDeposit: 1000,
    recurringAmount: 200,
    contributionEndAge: 26,
    interestRate: 12,
    boosts: [{ year: 2, amount: 500 }]
  };

    const manualSimulation = () => {
      let balance = inputsWithBoost.initialDeposit;
      let totalContributions = inputsWithBoost.initialDeposit;
      const monthlyFactor = Math.pow(1 + inputsWithBoost.interestRate / 100, 1 / 12);

      const time = deriveTimeState(inputsWithBoost.startingAge, inputsWithBoost.contributionEndAge);
      for (let month = 1; month <= time.totalYears * 12; month++) {
        const currentYear = Math.ceil(month / 12);
        const isFirstMonthOfYear = month % 12 === 1;

        if (currentYear <= time.contributionYears) {
          balance += inputsWithBoost.recurringAmount;
          totalContributions += inputsWithBoost.recurringAmount;
        }

        if (isFirstMonthOfYear && currentYear === 2) {
          balance += 500;
          totalContributions += 500;
        }

        balance *= monthlyFactor;
      }

      return { balance, totalContributions };
    };

  const manual = manualSimulation();
  const result = calculateProjection(inputsWithBoost);

  expect(result.finalBalance).toBeCloseTo(manual.balance, 4);
  expect(result.totalContributions).toBeCloseTo(manual.totalContributions);
  expect(result.yearly[1].totalContributions).toBeGreaterThan(result.yearly[0].totalContributions);
});
