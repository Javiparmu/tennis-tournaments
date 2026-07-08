import { describe, expect, it } from "vitest";
import { normalizeSearch } from "./search";

describe("normalizeSearch", () => {
  it("lowercases", () => {
    expect(normalizeSearch("ROGER")).toBe("roger");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeSearch("  open  ")).toBe("open");
  });

  it("strips diacritics", () => {
    expect(normalizeSearch("José")).toBe("jose");
    expect(normalizeSearch("Español")).toBe("espanol");
  });

  it("leaves an empty string empty", () => {
    expect(normalizeSearch("   ")).toBe("");
  });
});
