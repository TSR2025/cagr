import { describe, expect, test } from "vitest";

import {
  MIN_CONTRIB_WINDOW_YEARS,
  MIN_POST_START_YEARS,
  MAX_AGE,
  RETIREMENT_AGE,
  RETIREMENT_TAIL_YEARS,
  SNAP_INCREMENT_YEARS,
  deriveProjectionEndAge,
  normalizeContributionEndAge,
  normalizeTimeModel
} from "../lib/timeModel";

describe("time model", () => {
  test("locks projection end to retirement horizon and minimum post-start window", () => {
    const startingAge = 30;
    const projectionEndAge = deriveProjectionEndAge(startingAge);

    expect(projectionEndAge).toBe(RETIREMENT_AGE + RETIREMENT_TAIL_YEARS);
  });

  test("does not change projection end when contribution end moves", () => {
    const baseline = normalizeTimeModel(35, 50);
    const movedEnd = normalizeTimeModel(35, 60);

    expect(baseline.projectionEndAge).toBe(movedEnd.projectionEndAge);
  });

  test("clamps contribution end within projection domain using snapped steps", () => {
    const startingAge = 68;
    const projectionEndAge = deriveProjectionEndAge(startingAge);
    const minAllowed = Math.round((startingAge + MIN_CONTRIB_WINDOW_YEARS) / SNAP_INCREMENT_YEARS) * SNAP_INCREMENT_YEARS;
    const normalized = normalizeContributionEndAge(startingAge, 90, projectionEndAge);

    expect(normalized).toBeGreaterThanOrEqual(minAllowed);
    expect(normalized).toBeLessThanOrEqual(Math.floor(projectionEndAge / SNAP_INCREMENT_YEARS) * SNAP_INCREMENT_YEARS);
    expect(normalized % SNAP_INCREMENT_YEARS).toBe(0);
  });

  test("provides a minimum span for late starters", () => {
    const startingAge = 82;
    const projectionEndAge = deriveProjectionEndAge(startingAge);

    expect(projectionEndAge).toBe(Math.min(startingAge + MIN_POST_START_YEARS, MAX_AGE));
  });
});
