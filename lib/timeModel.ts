export const MIN_AGE = 18;
export const STARTING_MAX_AGE = 70;
export const MIN_CONTRIB_WINDOW_YEARS = 5;
export const SNAP_INCREMENT_YEARS = 5;
export const RETIREMENT_AGE = 65;
export const RETIREMENT_TAIL_YEARS = 10;
export const MAX_AGE = 90;
export const MIN_POST_START_YEARS = 10;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function snapToIncrement(value: number, increment: number) {
  const rounded = Math.round(Number(value) || 0);
  return Math.round(rounded / increment) * increment;
}

export function clampStartingAge(age: number) {
  return clamp(Math.round(Number.isFinite(age) ? age : MIN_AGE), MIN_AGE, STARTING_MAX_AGE);
}

export function deriveProjectionEndAge(startingAge: number) {
  const minTailTarget = RETIREMENT_AGE + RETIREMENT_TAIL_YEARS;
  const minPostStartTarget = startingAge + MIN_POST_START_YEARS;
  const target = Math.max(minTailTarget, minPostStartTarget);

  return Math.min(Math.round(target), MAX_AGE);
}

export function normalizeContributionEndAge(
  startingAge: number,
  contributionEndAge: number,
  projectionEndAge: number
) {
  const start = clampStartingAge(startingAge);
  const minimumEnd = snapToIncrement(start + MIN_CONTRIB_WINDOW_YEARS, SNAP_INCREMENT_YEARS);
  const maximumEnd = Math.floor(projectionEndAge / SNAP_INCREMENT_YEARS) * SNAP_INCREMENT_YEARS;
  const snapped = snapToIncrement(
    Number.isFinite(contributionEndAge) ? contributionEndAge : minimumEnd,
    SNAP_INCREMENT_YEARS
  );
  const clamped = clamp(snapped, minimumEnd, Math.max(minimumEnd, maximumEnd));

  return clamped;
}

export function normalizeTimeModel(startingAge: number, contributionEndAge: number) {
  const start = clampStartingAge(startingAge);
  const projectionEndAge = deriveProjectionEndAge(start);
  const end = normalizeContributionEndAge(start, contributionEndAge, projectionEndAge);

  return {
    startingAge: start,
    contributionEndAge: end,
    projectionEndAge,
    contributionYears: end - start,
    totalYears: projectionEndAge - start
  } as const;
}
