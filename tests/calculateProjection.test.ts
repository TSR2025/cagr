import { calculateProjection, Inputs } from "@/lib/calculations/calculateProjection";

const baseInputs: Inputs = {
  initialDeposit: 10000,
  recurringAmount: 500,
  recurringFrequency: "monthly",
  recurringYears: 2,
  projectionYears: 5,
  interestRate: 6,
  compounding: "monthly",
  boosts: [{ year: 3, amount: 2000 }]
};

test("calculates projection with monthly compounding", () => {
  const result = calculateProjection(baseInputs);
  expect(result.yearly[0].balance).toBeCloseTo(10000);
  expect(result.yearly[result.yearly.length - 1].year).toBe(5);
  expect(result.totalContributions).toBeGreaterThan(baseInputs.initialDeposit);
});

test("handles yearly compounding and yearly contributions", () => {
  const yearlyInputs: Inputs = {
    ...baseInputs,
    compounding: "yearly",
    recurringFrequency: "yearly",
    recurringAmount: 1200,
    boosts: []
  };
  const result = calculateProjection(yearlyInputs);
  expect(result.yearly[1].totalContributions).toBeCloseTo(10000 + 1200);
  expect(result.yearly[1].balance).toBeGreaterThan(result.yearly[1].totalContributions);
});
