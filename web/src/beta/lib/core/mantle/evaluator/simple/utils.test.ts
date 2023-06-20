import { expect, test, describe } from "vitest";

import { recursiveJSONParse } from "./utils"; // Import the function from your module/file

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
