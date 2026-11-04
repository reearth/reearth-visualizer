import { describe, expect, it } from "vitest";

import {
  addListItem,
  clearStoredValues,
  deleteListItem,
  fieldKey,
  generateProperty,
  getListItemIds,
  hasStoredValues,
  moveListItem
} from "./properties";
import type { PluginExtension, SchemaGroupDef } from "./types";

const list: SchemaGroupDef = {
  id: "items",
  list: true,
  fields: [{ id: "label", type: "string", defaultValue: "new" }]
};
const ext: PluginExtension = {
  id: "w",
  type: "widget",
  schema: {
    groups: [
      {
        id: "g",
        fields: [
          { id: "on", type: "bool", defaultValue: true },
          { id: "n", type: "number", defaultValue: 5 },
          { id: "s", type: "string", defaultValue: "hi" }
        ]
      },
      list
    ]
  }
};

describe("generateProperty", () => {
  it("uses defaults when nothing is stored", () => {
    expect(generateProperty(ext, "p", {})).toEqual({
      g: { on: true, n: 5, s: "hi" },
      items: []
    });
  });

  it("keeps false, 0 and empty strings", () => {
    const values = {
      [fieldKey("p", "w", "g", "on")]: false,
      [fieldKey("p", "w", "g", "n")]: 0,
      [fieldKey("p", "w", "g", "s")]: ""
    };
    expect(generateProperty(ext, "p", values).g).toEqual({
      on: false,
      n: 0,
      s: ""
    });
  });
});

describe("list groups", () => {
  it("starts empty: selecting an extension never adds an item", () => {
    expect(getListItemIds({}, "p", "w", list)).toEqual([]);
  });

  it("adds, moves and deletes items", () => {
    let v = addListItem({}, "p", "w", list);
    v = addListItem(v, "p", "w", list);
    expect(getListItemIds(v, "p", "w", list)).toEqual(["item-0", "item-1"]);

    v = moveListItem(v, "p", "w", list, "item-1", 0);
    expect(getListItemIds(v, "p", "w", list)).toEqual(["item-1", "item-0"]);
    expect((generateProperty(ext, "p", v).items as unknown[]).length).toBe(2);

    v = deleteListItem(v, "p", "w", list, "item-1");
    expect(getListItemIds(v, "p", "w", list)).toEqual(["item-0"]);
    v = deleteListItem(v, "p", "w", list, "item-0");
    expect(getListItemIds(v, "p", "w", list)).toEqual([]);
  });
});

describe("stored values", () => {
  it("reports and clears what is stored for one extension", () => {
    const other = { ...ext, id: "x" };
    const values = {
      [fieldKey("p", "w", "g", "n")]: 1,
      [fieldKey("p", "x", "g", "n")]: 2
    };
    expect(hasStoredValues(ext, "p", values)).toBe(true);
    const cleared = clearStoredValues(ext, "p", values);
    expect(hasStoredValues(ext, "p", cleared)).toBe(false);
    expect(hasStoredValues(other, "p", cleared)).toBe(true);
  });
});
