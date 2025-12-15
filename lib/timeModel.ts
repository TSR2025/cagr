export const MIN_AGE = 18;
export const MAX_AGE = 70;
export const MIN_CONTRIB_WINDOW_YEARS = 5;
export const SNAP_INCREMENT_YEARS = 5;
export const PROJECTION_MAX_AGE = 90;
export const PROJECTION_MIN_TOTAL_YEARS = 30;
export const PROJECTION_MIN_TAIL_YEARS = 15;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function snapToIncrement(value: number, increment: number) {
  const rounded = Math.round(Number(value) || 0);
  return Math.round(rounded / increment) * increment;
}

export function clampStartingAge(age: number) {
  return clamp(Math.round(Number.isFinite(age) ? age : MIN_AGE), MIN_AGE, MAX_AGE);
}

export function deriveProjectionEndAge(startingAge: number, contributionEndAge: number) {
  const minTailTarget = contributionEndAge + PROJECTION_MIN_TAIL_YEARS;
  const minTotalTarget = startingAge + PROJECTION_MIN_TOTAL_YEARS;
  const earliest = Math.max(minTailTarget, minTotalTarget);

  return clamp(Math.round(earliest), startingAge + PROJECTION_MIN_TOTAL_YEARS, PROJECTION_MAX_AGE);
}

export function normalizeContributionEndAge(startingAge: number, contributionEndAge: number) {
  const start = clampStartingAge(startingAge);
  const minimumEnd = snapToIncrement(start + MIN_CONTRIB_WINDOW_YEARS, SNAP_INCREMENT_YEARS);
  const snapped = snapToIncrement(Number.isFinite(contributionEndAge) ? contributionEndAge : minimumEnd, SNAP_INCREMENT_YEARS);
  const clamped = clamp(snapped, minimumEnd, PROJECTION_MAX_AGE);

  return clamped;
}

export function normalizeTimeModel(startingAge: number, contributionEndAge: number) {
  const start = clampStartingAge(startingAge);
  const end = normalizeContributionEndAge(start, contributionEndAge);
  const projectionEndAge = deriveProjectionEndAge(start, end);

  return {
    startingAge: start,
    contributionEndAge: end,
    projectionEndAge,
    contributionYears: end - start,
    totalYears: projectionEndAge - start
  } as const;
}
