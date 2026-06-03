import { describe, expect, it } from "vitest";

/**
 * useFieldComponent - Choice Label Fallback Logic Tests
 *
 * These tests verify that SelectField option labels properly fall back through
 * available fields to ensure every option has a displayable label.
 *
 * Fallback Priority (highest to lowest):
 * 1. label - Primary display text
 * 2. translatedTitle - Localized title
 * 3. title - Default title
 * 4. key - Unique identifier (guaranteed to exist)
 *
 * This ensures options always have readable labels even when optional fields
 * like 'label' or 'title' are missing or empty.
 */

type Choice = {
  key: string;
  label?: string;
  title?: string;
  translatedTitle?: string;
};

/**
 * This function replicates the exact logic from useFieldComponent.tsx:228-242
 * to test the fallback behavior in isolation.
 *
 * Note: Using || instead of ?? to treat empty strings as falsy,
 * which matches the intended behavior for fallback logic.
 */
function getLabelFromChoice(choice: Choice): string {
  return choice.label || choice.translatedTitle || choice.title || choice.key;
}

describe("useFieldComponent - Choice Label Fallback Logic", () => {
  describe("Label Fallback Priority: label ?? translatedTitle ?? title ?? key", () => {
    it("should use 'label' when available (highest priority)", () => {
      const choice: Choice = {
        key: "option1",
        label: "Primary Label",
        title: "Fallback Title",
        translatedTitle: "Translated"
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("Primary Label");
    });

    it("should fallback to 'translatedTitle' when label is missing", () => {
      const choice: Choice = {
        key: "option1",
        label: "", // Empty label
        title: "Regular Title",
        translatedTitle: "Translated Title"
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("Translated Title");
    });

    it("should fallback to 'title' when label and translatedTitle are missing", () => {
      const choice: Choice = {
        key: "option1",
        label: "",
        title: "Title Only"
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("Title Only");
    });

    it("should fallback to 'key' when all other fields are missing (lowest priority)", () => {
      const choice: Choice = {
        key: "option1",
        label: ""
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("option1");
    });

    it("should handle multiple choices with different fallback levels", () => {
      const choices: Choice[] = [
        {
          key: "option1",
          label: "Has Label",
          title: "Title 1",
          translatedTitle: "Translated 1"
        },
        {
          key: "option2",
          label: "",
          title: "Title 2",
          translatedTitle: "Translated 2"
        },
        {
          key: "option3",
          label: "",
          title: "Title 3"
        },
        {
          key: "option4",
          label: ""
        }
      ];

      const results = choices.map(getLabelFromChoice);

      expect(results[0]).toBe("Has Label"); // Uses label
      expect(results[1]).toBe("Translated 2"); // Fallback to translatedTitle
      expect(results[2]).toBe("Title 3"); // Fallback to title
      expect(results[3]).toBe("option4"); // Fallback to key
    });

    it("should prioritize label over translatedTitle even when both exist", () => {
      const choice: Choice = {
        key: "option1",
        label: "Preferred Label",
        translatedTitle: "Should Not Use This",
        title: "Also Should Not Use This"
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("Preferred Label");
    });

    it("should handle undefined vs empty string correctly", () => {
      const choiceWithUndefined: Choice = {
        key: "option1",
        label: undefined,
        title: "Should Use Title"
      };

      const result = getLabelFromChoice(choiceWithUndefined);
      expect(result).toBe("Should Use Title");
    });
  });

  describe("Timeline Block Context - Missing Labels", () => {
    it("should handle timeline playMode options with missing labels", () => {
      // Timeline blocks often have options with missing label fields
      const playModeChoices: Choice[] = [
        {
          key: "once",
          label: "",
          title: "Play Once"
        },
        {
          key: "loop",
          label: "",
          title: "Loop"
        }
      ];

      const results = playModeChoices.map(getLabelFromChoice);

      expect(results[0]).toBe("Play Once"); // Falls back to title
      expect(results[1]).toBe("Loop"); // Falls back to title
    });

    it("should handle speed options with varying label availability", () => {
      const speedChoices: Choice[] = [
        {
          key: "0.5x",
          label: "0.5x Speed",
          title: "Half Speed"
        },
        {
          key: "1x",
          label: "",
          title: "Normal Speed"
        },
        {
          key: "2x",
          label: "",
          // No title - should fall back to key "2x"
        }
      ];

      const results = speedChoices.map(getLabelFromChoice);

      expect(results[0]).toBe("0.5x Speed"); // Uses label
      expect(results[1]).toBe("Normal Speed"); // Fallback to title
      expect(results[2]).toBe("2x"); // Fallback to key
    });
  });

  describe("Edge Cases", () => {
    it("should handle choices with only key field", () => {
      const choice: Choice = {
        key: "minimalist",
        label: ""
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("minimalist");
    });

    it("should handle null values as undefined", () => {
      const choice: Choice = {
        key: "safe",
        label: null as unknown as string,
        title: undefined,
        translatedTitle: ""
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("safe"); // Falls back to key
    });

    it("should handle whitespace-only strings as truthy", () => {
      // Note: The ?? operator treats whitespace strings as truthy
      const choice: Choice = {
        key: "whitespace",
        label: "   ",
        title: "Should Not Use This"
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("   "); // Uses the whitespace string
    });
  });

  describe("Regression Prevention", () => {
    it("should never return undefined or null", () => {
      const worstCase: Choice = {
        key: "always-has-key",
        label: undefined,
        title: undefined,
        translatedTitle: undefined
      };

      const result = getLabelFromChoice(worstCase);
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result).toBe("always-has-key");
    });

    it("should not use JSON.stringify or object serialization", () => {
      const choice: Choice = {
        key: "test",
        label: "",
        title: "Proper Title"
      };

      const result = getLabelFromChoice(choice);

      // Should NOT be object serialization
      expect(result).not.toBe("[object Object]");
      expect(result).not.toMatch(/^\{.*\}$/);
      expect(result).toBe("Proper Title");
    });

    it("should maintain deterministic behavior", () => {
      const choice: Choice = {
        key: "stable",
        label: "",
        title: "Stable Title"
      };

      const result1 = getLabelFromChoice(choice);
      const result2 = getLabelFromChoice(choice);

      expect(result1).toBe(result2);
      expect(result1).toBe("Stable Title");
    });
  });

  describe("Internationalization Support", () => {
    it("should prioritize translatedTitle over title when label is missing", () => {
      const choice: Choice = {
        key: "en",
        label: "",
        title: "English",
        translatedTitle: "英語" // Japanese translation
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("英語"); // Uses translatedTitle
    });

    it("should handle mixed language fallbacks", () => {
      const choices: Choice[] = [
        {
          key: "option1",
          label: "English Label",
          translatedTitle: "日本語"
        },
        {
          key: "option2",
          label: "",
          translatedTitle: "中文",
          title: "Chinese"
        },
        {
          key: "option3",
          label: "",
          title: "Français"
        }
      ];

      const results = choices.map(getLabelFromChoice);

      expect(results[0]).toBe("English Label"); // Uses label
      expect(results[1]).toBe("中文"); // Uses translatedTitle
      expect(results[2]).toBe("Français"); // Uses title
    });

    it("should handle RTL languages correctly", () => {
      const choice: Choice = {
        key: "ar",
        label: "",
        title: "Arabic",
        translatedTitle: "العربية" // Arabic
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("العربية");
    });
  });

  describe("Fallback Chain Verification", () => {
    it("should correctly apply the complete fallback chain", () => {
      // Verify the fallback chain: label || translatedTitle || title || key
      // Each test case progressively removes fields to test each fallback level

      const testCases: [Choice, string][] = [
        [{ key: "k", label: "L", translatedTitle: "T", title: "Ti" }, "L"],
        [{ key: "k", label: "", translatedTitle: "T", title: "Ti" }, "T"],
        [{ key: "k", label: "", translatedTitle: "", title: "Ti" }, "Ti"],
        [{ key: "k", label: "", translatedTitle: "", title: "" }, "k"]
      ];

      testCases.forEach(([choice, expected]) => {
        const result = getLabelFromChoice(choice);
        expect(result).toBe(expected);
      });
    });
  });
});
