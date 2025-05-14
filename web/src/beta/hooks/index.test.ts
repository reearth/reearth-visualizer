import { describe, it, expect } from "vitest";

import { useEditorNavigation, useSettingsNavigation } from "./index";

describe("hooks/index", () => {
  it("should export useEditorNavigation", () => {
    expect(useEditorNavigation).toBeDefined();
  });

  it("should export useSettingsNavigation", () => {
    expect(useSettingsNavigation).toBeDefined();
  });
});
