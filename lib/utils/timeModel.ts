export const MIN_AGE = 18;
export const MAX_AGE = 70;
export const MIN_CONTRIB_WINDOW_YEARS = 5;
export const SNAP_INCREMENT_YEARS = 5;
export const PROJECTION_MAX_AGE = 90;
export const PROJECTION_MIN_TOTAL_YEARS = 30;
export const PROJECTION_MIN_TAIL_YEARS = 15;

export function snapToIncrement(value: number, increment: number): number {
  if (increment === 0) return Math.round(value);
  return Math.round(value / increment) * increment;
}

export function clampStartingAge(value: number): number {
  const rounded = Math.round(value);
  return Math.min(Math.max(rounded, MIN_AGE), MAX_AGE);
}

export function clampContributionEndAge(startingAge: number, value: number): number {
  const snappedMinimum = snapToIncrement(startingAge + MIN_CONTRIB_WINDOW_YEARS, SNAP_INCREMENT_YEARS);
  const snapped = snapToIncrement(value, SNAP_INCREMENT_YEARS);
  const clamped = Math.min(Math.max(snapped, snappedMinimum), PROJECTION_MAX_AGE);
  return clamped;
}

export function deriveProjectionEndAge(startingAge: number, contributionEndAge: number): number {
  const baseline = startingAge + PROJECTION_MIN_TOTAL_YEARS;
  const tailTarget = contributionEndAge + PROJECTION_MIN_TAIL_YEARS;
  return Math.min(PROJECTION_MAX_AGE, Math.max(tailTarget, baseline));
}

export function normalizeTimeState(startingAge: number, contributionEndAge: number) {
  const sanitizedStart = clampStartingAge(startingAge);
  const sanitizedContributionEnd = clampContributionEndAge(sanitizedStart, contributionEndAge);
  const projectionEndAge = deriveProjectionEndAge(sanitizedStart, sanitizedContributionEnd);

  return {
    startingAge: sanitizedStart,
    contributionEndAge: sanitizedContributionEnd,
    projectionEndAge,
    contributionYears: Math.max(sanitizedContributionEnd - sanitizedStart, 0),
    totalYears: Math.max(projectionEndAge - sanitizedStart, 0)
  } as const;
}
