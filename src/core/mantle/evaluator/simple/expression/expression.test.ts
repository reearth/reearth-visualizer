import jsep from "jsep";
import { expect, test, describe, beforeEach } from "vitest";

import { Feature } from "../../../types";

import {
  replaceDefines,
  removeBackslashes,
  Expression,
  EXPRESSION_CACHES,
  clearExpressionCaches,
} from "./expression";
import { createRuntimeAst } from "./runtime";

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

describe("expression caches", () => {
  beforeEach(() => {
    EXPRESSION_CACHES.clear();
  });

  test("should remove caches", () => {
    const key = "czm_HEIGHT > 2 ? color('red') : color('blue')";
    const feature = { properties: { HEIGHT: 1 } } as Feature;
    const expression = new Expression("${HEIGHT} > 2 ? color('red') : color('blue')", feature);
    expect(EXPRESSION_CACHES.get(key)).toEqual(createRuntimeAst(expression, jsep(key)));

    clearExpressionCaches(key, feature, undefined);

    expect(EXPRESSION_CACHES.get(key)).toBeUndefined();
  });
});
