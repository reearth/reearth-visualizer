import { describe, it, expect } from "vitest";

import { resolveLangHeader } from "./langLink";

describe("resolveLangHeader", () => {
  it("returns the bare locale as-is", () => {
    expect(resolveLangHeader("ja")).toBe("ja");
    expect(resolveLangHeader("en")).toBe("en");
  });

  it("strips the region suffix from a locale", () => {
    expect(resolveLangHeader("ja-JP")).toBe("ja");
    expect(resolveLangHeader("en-US")).toBe("en");
  });

  it("falls back to the default language for an empty locale", () => {
    expect(resolveLangHeader("")).toBe("en");
  });

  it("falls back to the default language for a malformed locale", () => {
    expect(resolveLangHeader("1")).toBe("en");
    expect(resolveLangHeader("-")).toBe("en");
  });
});
