import type { Item } from "@reearth/services/api/property";
import { describe, it, expect } from "vitest";

import { filterVisibleItems } from "./utils";

describe("filterVisibleItems", () => {
  it("should return undefined if items are not provided", () => {
    expect(filterVisibleItems()).toBeUndefined();
  });

  it("should filter items based on the 'only' field", () => {
    const items = [
      {
        only: { field: "field1", value: "value1" },
        schemaFields: [{ id: "field1", defaultValue: "value1" }],
        fields: [{ id: "field1", value: "value1" }]
      },
      {
        only: { field: "field2", value: "value2" },
        schemaFields: [{ id: "field2", defaultValue: "value2" }],
        fields: [{ id: "field2", value: "wrongValue" }]
      }
    ];

    const result = filterVisibleItems(items as Item[]);
    expect(result).toEqual([items[0]]);
  });
});
