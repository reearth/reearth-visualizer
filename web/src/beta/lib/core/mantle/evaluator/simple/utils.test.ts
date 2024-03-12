import { expect, test, describe } from "vitest";

import { Feature, StyleExpression } from "../../types";

import {
  getReferences,
  getCacheableProperties,
  getCombinedReferences,
  recursiveJSONParse,
} from "./utils"; // Import the function from your module/file

describe("recursiveJSONParse", () => {
  test("should parse nested JSON strings within an object", () => {
    const obj = {
      name: "John",
      age: "25",
      data: '{"city": "New York", "country": "USA"}',
    };
    const expected = {
      name: "John",
      age: "25",
      data: {
        city: "New York",
        country: "USA",
      },
    };

    const result = recursiveJSONParse(obj);
    expect(result).toEqual(expected);
  });

  test("should handle non-object values and null", () => {
    const str = "Test";
    const num = 123;
    const bool = true;
    const arr = ["one", "two"];
    const emptyObj = {};
    const nullValue = null;

    expect(recursiveJSONParse(str)).toBe(str);
    expect(recursiveJSONParse(num)).toBe(num);
    expect(recursiveJSONParse(bool)).toBe(bool);
    expect(recursiveJSONParse(arr)).toEqual(arr);
    expect(recursiveJSONParse(emptyObj)).toEqual(emptyObj);
    expect(recursiveJSONParse(nullValue)).toBe(nullValue);
  });

  test("should handle invalid JSON strings", () => {
    const obj = {
      name: "John",
      age: "25",
      data: '{city: "New York", country: "USA"}', // Invalid JSON string
    };
    const expected = {
      name: "John",
      age: "25",
      data: '{city: "New York", country: "USA"}', // Invalid JSON string remains unchanged
    };

    const result = recursiveJSONParse(obj);
    expect(result).toEqual(expected);
  });
});

describe("getCacheableProperties", () => {
  const feature: Feature = {
    id: "test",
    type: "feature",
    properties: {
      name: "Test Feature",
      description: "This is a test feature",
      test: "test_path",
    },
  };

  const styleExpression: StyleExpression = "color: ${test}";

  test("should return cacheable properties", () => {
    const properties = getCacheableProperties(styleExpression, feature);
    expect(properties).toEqual({ test: "test_path" });
  });

  const styleExpressionBeta: StyleExpression = "color: ${$.['test_var']}";

  test("should return combined references", () => {
    const references = getCacheableProperties(styleExpressionBeta, feature);
    expect(references).toEqual({
      name: "Test Feature",
      description: "This is a test feature",
      test: "test_path",
    });
  });
});

describe("getCombinedReferences", () => {
  const styleExpression: StyleExpression = {
    conditions: [
      ["${test_var} === 1", "color: blue"],
      ["${test_var} === 2", "color: red"],
    ],
  };

  test("should return combined references", () => {
    const references = getCombinedReferences(styleExpression);
    expect(references).toEqual(["test_var", "test_var"]);
  });
});

describe("getReferences", () => {
  test("should return references in a string expression", () => {
    const references = getReferences("color: ${test_var}");
    expect(references).toEqual(["test_var"]);
  });

  test("should return references in a string expression with quotes", () => {
    const references = getReferences('color: "${test_var}"');
    expect(references).toEqual(["test_var"]);
  });

  test("should return references in a string expression with single quotes", () => {
    const references = getReferences("color: '${test_var}'");
    expect(references).toEqual(["test_var"]);
  });

  test("should return JSONPATH_IDENTIFIER for expressions with variable expression syntax", () => {
    const references = getReferences("color: ${$.['test_var']}");
    expect(references).toEqual(["REEARTH_JSONPATH"]);
  });
});
