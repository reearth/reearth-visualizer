import { describe, expect, it } from "vitest";

/**
 * useFieldComponent - Choice Label Fallback Logic Tests
 *
 * These tests verify that SelectField option labels properly fall back through
 * available fields using nullish coalescing (??) operator.
 *
 * Fallback Priority (highest to lowest):
 * 1. label - Primary display text
 * 2. translatedTitle - Localized title
 * 3. title - Default title
 * 4. key - Unique identifier (guaranteed to exist)
 *
 * Important: Uses ?? (nullish coalescing), which only treats null/undefined as
 * triggering fallback. Empty strings ("") are considered valid values and will
 * NOT trigger fallback.
 */

type Choice = {
  key: string;
  label?: string;
  title?: string;
  translatedTitle?: string;
};

/**
 * This function replicates the exact logic from useFieldComponent.tsx:241
 * to test the fallback behavior in isolation.
 *
 * Production code uses ?? (nullish coalescing), which only falls back for
 * null/undefined, NOT for empty strings. Empty strings will be displayed as-is.
 */
function getLabelFromChoice(choice: Choice): string {
  return choice.label ?? choice.translatedTitle ?? choice.title ?? choice.key;
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

    it("should fallback to 'translatedTitle' when label is undefined", () => {
      const choice: Choice = {
        key: "option1",
        label: undefined, // Undefined label
        title: "Regular Title",
        translatedTitle: "Translated Title"
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("Translated Title");
    });

    it("should fallback to 'title' when label and translatedTitle are undefined", () => {
      const choice: Choice = {
        key: "option1",
        label: undefined,
        translatedTitle: undefined,
        title: "Title Only"
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("Title Only");
    });

    it("should fallback to 'key' when all other fields are undefined (lowest priority)", () => {
      const choice: Choice = {
        key: "option1",
        label: undefined,
        translatedTitle: undefined,
        title: undefined
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
          label: undefined,
          title: "Title 2",
          translatedTitle: "Translated 2"
        },
        {
          key: "option3",
          label: undefined,
          translatedTitle: undefined,
          title: "Title 3"
        },
        {
          key: "option4",
          label: undefined,
          translatedTitle: undefined,
          title: undefined
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

    it("should fallback for undefined but NOT for empty strings", () => {
      // Undefined triggers fallback
      const choiceWithUndefined: Choice = {
        key: "option1",
        label: undefined,
        title: "Should Use Title"
      };
      expect(getLabelFromChoice(choiceWithUndefined)).toBe("Should Use Title");

      // Empty string does NOT trigger fallback with ??
      const choiceWithEmptyString: Choice = {
        key: "option2",
        label: "",
        title: "Should NOT Use This"
      };
      expect(getLabelFromChoice(choiceWithEmptyString)).toBe(""); // Returns empty string
    });
  });

  describe("Timeline Block Context - Missing Labels", () => {
    it("should handle timeline playMode options with undefined labels", () => {
      // Timeline blocks often have options with undefined label fields
      const playModeChoices: Choice[] = [
        {
          key: "once",
          label: undefined,
          title: "Play Once"
        },
        {
          key: "loop",
          label: undefined,
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
          label: undefined,
          title: "Normal Speed"
        },
        {
          key: "2x",
          label: undefined,
          translatedTitle: undefined,
          title: undefined
          // No label/title - should fall back to key "2x"
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
        label: undefined,
        translatedTitle: undefined,
        title: undefined
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("minimalist");
    });

    it("should handle null values as triggering fallback", () => {
      const choice: Choice = {
        key: "safe",
        label: null as unknown as undefined,
        title: undefined,
        translatedTitle: null as unknown as undefined
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("safe"); // Falls back to key
    });

    it("should NOT fallback for empty or whitespace strings with ??", () => {
      // The ?? operator treats empty/whitespace strings as truthy (not nullish)
      const choiceEmptyString: Choice = {
        key: "empty",
        label: "",
        title: "Should Not Use This"
      };
      expect(getLabelFromChoice(choiceEmptyString)).toBe(""); // Returns empty string

      const choiceWhitespace: Choice = {
        key: "whitespace",
        label: "   ",
        title: "Should Not Use This"
      };
      expect(getLabelFromChoice(choiceWhitespace)).toBe("   "); // Returns whitespace
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
        label: undefined,
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
        label: undefined,
        title: "Stable Title"
      };

      const result1 = getLabelFromChoice(choice);
      const result2 = getLabelFromChoice(choice);

      expect(result1).toBe(result2);
      expect(result1).toBe("Stable Title");
    });
  });

  describe("Internationalization Support", () => {
    it("should prioritize translatedTitle over title when label is undefined", () => {
      const choice: Choice = {
        key: "en",
        label: undefined,
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
          label: undefined,
          translatedTitle: "中文",
          title: "Chinese"
        },
        {
          key: "option3",
          label: undefined,
          translatedTitle: undefined,
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
        label: undefined,
        title: "Arabic",
        translatedTitle: "العربية" // Arabic
      };

      const result = getLabelFromChoice(choice);
      expect(result).toBe("العربية");
    });
  });

  describe("Fallback Chain Verification", () => {
    it("should correctly apply the complete fallback chain with ??", () => {
      // Verify the fallback chain: label ?? translatedTitle ?? title ?? key
      // With ??, only null/undefined trigger fallback, NOT empty strings
      // Each test case progressively removes fields to test each fallback level

      const testCases: [Choice, string][] = [
        [{ key: "k", label: "L", translatedTitle: "T", title: "Ti" }, "L"],
        [{ key: "k", label: undefined, translatedTitle: "T", title: "Ti" }, "T"],
        [
          { key: "k", label: undefined, translatedTitle: undefined, title: "Ti" },
          "Ti"
        ],
        [
          {
            key: "k",
            label: undefined,
            translatedTitle: undefined,
            title: undefined
          },
          "k"
        ]
      ];

      testCases.forEach(([choice, expected]) => {
        const result = getLabelFromChoice(choice);
        expect(result).toBe(expected);
      });
    });

    it("should NOT fallback for empty strings (demonstrating ?? behavior)", () => {
      // Empty strings are not nullish, so they don't trigger fallback
      const testCases: [Choice, string][] = [
        [{ key: "k", label: "", translatedTitle: "T", title: "Ti" }, ""], // Returns empty
        [{ key: "k", label: undefined, translatedTitle: "", title: "Ti" }, ""], // Returns empty
        [
          { key: "k", label: undefined, translatedTitle: undefined, title: "" },
          ""
        ] // Returns empty
      ];

      testCases.forEach(([choice, expected]) => {
        const result = getLabelFromChoice(choice);
        expect(result).toBe(expected);
      });
    });
  });
});
