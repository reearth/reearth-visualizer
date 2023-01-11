import { describe, test, expect } from "vitest";

import { replaceVariables } from "./variableReplacer";

describe("replaceVariables", () => {
  test("should replace the variable placeholders with the corresponding variable names in the expression string", () => {
    const [result, _] = replaceVariables("${variable}");
    expect(result).toBe("czm_variable");
  });

  test("should handle multiple variable placeholders in the expression string", () => {
    const [result, _] = replaceVariables("${variable1} + ${variable2}");
    expect(result).toBe("czm_variable1 + czm_variable2");
  });

  test("should handle JSONPath palceholders in the expression string", () => {
    const [, res] = replaceVariables("${$.phoneNumbers[:1].type}", {
      id: "blah",
      firstName: "John",
      lastName: "doe",
      age: 26,
      address: {
        streetAddress: "naist street",
        city: "Nara",
        postalCode: "630-0192",
      },
      phoneNumbers: [
        {
          type: "iPhone",
          number: "0123-4567-8888",
        },
        {
          type: "home",
          number: "0123-4567-8910",
        },
      ],
    });
    expect(res[0].literalValue).toBe("iPhone");
  });
});
