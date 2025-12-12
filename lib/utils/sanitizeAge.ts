export const DEFAULT_CURRENT_AGE = 25;
const MIN_AGE = 0;
const MAX_AGE = 100;

export function sanitizeAge(input: string | number, fallback: number = DEFAULT_CURRENT_AGE): number {
  if (typeof input === "string" && input.trim() === "") return fallback;

  const numeric = typeof input === "number" ? input : Number(input);
  if (!Number.isFinite(numeric)) return fallback;

  const rounded = Math.round(numeric);
  const clamped = Math.min(Math.max(rounded, MIN_AGE), MAX_AGE);

  return Number.isFinite(clamped) ? clamped : fallback;
}

export function deriveEndAges(currentAge: number, contributeYears: number, projectYears: number) {
  return {
    endAge: currentAge + projectYears,
    contribEndAge: currentAge + contributeYears
  };
}
