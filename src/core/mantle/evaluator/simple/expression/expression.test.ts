import { expect, test, describe } from "vitest";

import { replaceDefines, removeBackslashes } from "./expression";

describe("replaceDefines", () => {
  test("should replace defined placeholders with the corresponding values in the expression string", () => {
    const result = replaceDefines("${key}", { key: "value" });
    expect(result).toBe("(value)");
  });

  test("should handle multiple defined placeholders in the expression string", () => {
    const result = replaceDefines("${key1} + ${key2}", {
      key1: "value1",
      key2: "value2",
    });
    expect(result).toBe("(value1) + (value2)");
  });
});

describe("removeBackslashes", () => {
  test("should remove all backslashes from the expression string", () => {
    const result = removeBackslashes("\\");
    expect(result).toBe("@#%");
  });

  test("should handle multiple backslashes in the expression string", () => {
    const result = removeBackslashes("\\\\");
    expect(result).toBe("@#%@#%");
  });
});
