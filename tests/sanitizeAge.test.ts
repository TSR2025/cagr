import { describe, expect, it } from "vitest";
import { DEFAULT_CURRENT_AGE, sanitizeAge } from "../lib/utils/sanitizeAge";

describe("sanitizeAge", () => {
  it("returns default when input is invalid", () => {
    expect(sanitizeAge("", DEFAULT_CURRENT_AGE)).toBe(DEFAULT_CURRENT_AGE);
    expect(sanitizeAge(NaN, DEFAULT_CURRENT_AGE)).toBe(DEFAULT_CURRENT_AGE);
  });

  it("clamps values within bounds", () => {
    expect(sanitizeAge(-5, DEFAULT_CURRENT_AGE)).toBe(0);
    expect(sanitizeAge(150, DEFAULT_CURRENT_AGE)).toBe(100);
  });

  it("rounds to the nearest whole number", () => {
    expect(sanitizeAge(29.7, DEFAULT_CURRENT_AGE)).toBe(30);
    expect(sanitizeAge(29.2, DEFAULT_CURRENT_AGE)).toBe(29);
  });
});
