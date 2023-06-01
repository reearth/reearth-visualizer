import jsep from "jsep";
import { expect, test, describe, beforeEach } from "vitest";

import { Feature } from "../../../types";

import {
  replaceDefines,
  removeBackslashes,
  Expression,
  EXPRESSION_CACHES,
  clearExpressionCaches,
  REPLACED_VARIABLES_CACHE,
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
    const originalExpression = "${HEIGHT} > 2 ? color('red') : color('blue')";
    const replacedExpression = "czm_HEIGHT > 2 ? color('red') : color('blue')";
    const feature = { properties: { HEIGHT: 1 } } as Feature;
    const expression = new Expression(originalExpression, feature);
    expect(REPLACED_VARIABLES_CACHE.get(originalExpression)).toEqual([replacedExpression, []]);
    expect(EXPRESSION_CACHES.get(replacedExpression)).toEqual(
      createRuntimeAst(expression, jsep(replacedExpression)),
    );

    clearExpressionCaches(originalExpression, feature, undefined);

    expect(REPLACED_VARIABLES_CACHE.get(originalExpression)).toBeUndefined();
    expect(EXPRESSION_CACHES.get(replacedExpression)).toBeUndefined();
  });
});
