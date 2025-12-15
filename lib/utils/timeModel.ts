export const MIN_AGE = 18;
export const MAX_AGE = 70;
export const MIN_CONTRIB_WINDOW_YEARS = 5;
export const SNAP_INCREMENT_YEARS = 5;
export const PROJECTION_MAX_AGE = 90;
export const PROJECTION_MIN_TOTAL_YEARS = 30;
export const PROJECTION_MIN_TAIL_YEARS = 15;

export const DEFAULT_STARTING_AGE = 25;
export const DEFAULT_CONTRIBUTION_END_AGE = 45;

export function snapToIncrement(value: number, increment = SNAP_INCREMENT_YEARS): number {
  return Math.round(value / increment) * increment;
}

export function clampStartingAge(value: number): number {
  const rounded = Math.round(value);
  return Math.min(Math.max(rounded, MIN_AGE), MAX_AGE);
}

export function minimumContributionEndAge(startingAge: number): number {
  return snapToIncrement(startingAge + MIN_CONTRIB_WINDOW_YEARS, SNAP_INCREMENT_YEARS);
}

export function clampContributionEndAge(startingAge: number, value: number): number {
  const snapped = snapToIncrement(value, SNAP_INCREMENT_YEARS);
  const minAge = minimumContributionEndAge(startingAge);
  const maxAge = PROJECTION_MAX_AGE;

  return Math.min(Math.max(snapped, minAge), maxAge);
}

export function deriveProjectionEndAge(startingAge: number, contributionEndAge: number): number {
  const totalYearsFloor = startingAge + PROJECTION_MIN_TOTAL_YEARS;
  const tailMinimum = contributionEndAge + PROJECTION_MIN_TAIL_YEARS;

  return Math.min(PROJECTION_MAX_AGE, Math.max(tailMinimum, totalYearsFloor));
}

export function deriveTimeState(startingAge: number, contributionEndAge: number) {
  const sanitizedStartingAge = clampStartingAge(startingAge);
  const sanitizedContributionEndAge = clampContributionEndAge(sanitizedStartingAge, contributionEndAge);
  const projectionEndAge = deriveProjectionEndAge(sanitizedStartingAge, sanitizedContributionEndAge);

  const contributionYears = sanitizedContributionEndAge - sanitizedStartingAge;
  const totalYears = projectionEndAge - sanitizedStartingAge;

  return {
    startingAge: sanitizedStartingAge,
    contributionEndAge: sanitizedContributionEndAge,
    projectionEndAge,
    contributionYears,
    totalYears
  } as const;
}
