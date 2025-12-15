import { normalizeTimeModel } from "../timeModel";

export interface OneTimeBoost {
  year: number;
  amount: number;
  label?: string;
}

export interface Inputs {
  initialDeposit: number;
  recurringAmount: number;
  interestRate: number;
  startingAge: number;
  contributionEndAge: number;
  boosts: OneTimeBoost[];
}

export interface YearRecord {
  year: number;
  age: number;
  balance: number;
  totalContributions: number;
  totalInterest: number;
}

export interface ProjectionResult {
  finalBalance: number;
  totalContributions: number;
  totalInterest: number;
  yearly: YearRecord[];
  milestones: YearRecord[];
  startingAge: number;
  contributionEndAge: number;
  projectionEndAge: number;
  contributionYears: number;
  totalYears: number;
}

export function calculateProjection(inputs: Inputs): ProjectionResult {
  const { initialDeposit, recurringAmount, interestRate, boosts } = inputs;
  const time = normalizeTimeModel(inputs.startingAge, inputs.contributionEndAge);
  const { startingAge, contributionYears, totalYears } = time;

  const totalMonths = totalYears * 12;
  const contributionMonths = Math.max(contributionYears, 0) * 12;

  const sanitizedBoosts = boosts
    .filter((b) => b.amount > 0 && b.year >= 1 && b.year <= totalYears)
    .slice(0, 5);

  const yearly: YearRecord[] = [
    {
      year: 0,
      age: startingAge,
      balance: initialDeposit,
      totalContributions: initialDeposit,
      totalInterest: 0
    }
  ];

  let balance = initialDeposit;
  let totalContributions = initialDeposit;

  const monthlyFactor = Math.pow(1 + interestRate / 100, 1 / 12);

  for (let month = 1; month <= totalMonths; month++) {
    const currentYear = Math.ceil(month / 12);
    const isFirstMonthOfYear = month % 12 === 1;

    if (month <= contributionMonths) {
      balance += recurringAmount;
      totalContributions += recurringAmount;
    }

    const boost = sanitizedBoosts.find((b) => b.year === currentYear && isFirstMonthOfYear);
    if (boost) {
      balance += boost.amount;
      totalContributions += boost.amount;
    }

    balance *= monthlyFactor;

    const isYearEnd = month % 12 === 0;
    if (isYearEnd) {
      const year = month / 12;
      yearly.push({
        year,
        age: startingAge + year,
        balance,
        totalContributions,
        totalInterest: balance - totalContributions
      });
    }
  }

  const milestones = yearly.filter((record, index) => record.year % 5 === 0 || index === yearly.length - 1);

  return {
    finalBalance: balance,
    totalContributions,
    totalInterest: balance - totalContributions,
    yearly,
    milestones,
    ...time
  };
}
