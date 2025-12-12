export type Compounding = "monthly" | "yearly";

export interface OneTimeBoost {
  year: number;
  amount: number;
  label?: string;
}

export interface Inputs {
  initialDeposit: number;
  recurringAmount: number;
  recurringYears: number;
  projectionYears: number;
  interestRate: number;
  compounding: Compounding;
  boosts: OneTimeBoost[];
}

export interface YearRecord {
  year: number;
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
}

export function calculateProjection(inputs: Inputs): ProjectionResult {
  const {
    initialDeposit,
    recurringAmount,
    recurringYears,
    projectionYears,
    interestRate,
    compounding,
    boosts
  } = inputs;

  const sanitizedBoosts = boosts
    .filter((b) => b.amount > 0 && b.year >= 1 && b.year <= projectionYears)
    .slice(0, 5);

  const yearly: YearRecord[] = [{
    year: 0,
    balance: initialDeposit,
    totalContributions: initialDeposit,
    totalInterest: 0
  }];

  let balance = initialDeposit;
  let totalContributions = initialDeposit;

  if (compounding === "monthly") {
    const monthlyRate = interestRate / 100 / 12;
    for (let month = 1; month <= projectionYears * 12; month++) {
      const currentYear = Math.ceil(month / 12);
      const isFirstMonthOfYear = month % 12 === 1;

      if (currentYear <= recurringYears) {
        balance += recurringAmount;
        totalContributions += recurringAmount;
      }

      const boost = sanitizedBoosts.find((b) => b.year === currentYear && isFirstMonthOfYear);
      if (boost) {
        balance += boost.amount;
        totalContributions += boost.amount;
      }

      balance *= 1 + monthlyRate;

      const isYearEnd = month % 12 === 0;
      if (isYearEnd) {
        const year = month / 12;
        yearly.push({
          year,
          balance,
          totalContributions,
          totalInterest: balance - totalContributions
        });
      }
    }
  } else {
    const annualRate = interestRate / 100;
    for (let year = 1; year <= projectionYears; year++) {
      if (year <= recurringYears) {
        const contribution = recurringAmount * 12;
        balance += contribution;
        totalContributions += contribution;
      }

      const boost = sanitizedBoosts.find((b) => b.year === year);
      if (boost) {
        balance += boost.amount;
        totalContributions += boost.amount;
      }

      balance *= 1 + annualRate;

      yearly.push({
        year,
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
    milestones
  };
}
