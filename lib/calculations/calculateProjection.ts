export interface OneTimeBoost {
  year: number;
  amount: number;
  label?: string;
}

export interface Inputs {
  initialDeposit: number;
  recurringAmount: number;
  contributeYears: number;
  projectYears: number;
  interestRate: number;
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
    contributeYears,
    projectYears,
    interestRate,
    boosts
  } = inputs;

  const sanitizedBoosts = boosts
    .filter((b) => b.amount > 0 && b.year >= 1 && b.year <= projectYears)
    .slice(0, 5);

  const yearly: YearRecord[] = [{
    year: 0,
    balance: initialDeposit,
    totalContributions: initialDeposit,
    totalInterest: 0
  }];

  let balance = initialDeposit;
  let totalContributions = initialDeposit;

  const monthlyFactor = Math.pow(1 + interestRate / 100, 1 / 12);

  for (let month = 1; month <= projectYears * 12; month++) {
    const currentYear = Math.ceil(month / 12);
    const isFirstMonthOfYear = month % 12 === 1;

    if (currentYear <= contributeYears) {
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
