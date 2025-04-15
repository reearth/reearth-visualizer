import { Item } from "@reearth/services/api/propertyApi/utils";
import { render, screen } from "@reearth/test/utils";
import React from "react";
import { describe, expect, test, vi, beforeEach } from "vitest";

import PropertyItem from "./index";

vi.mock("./hooks", () => ({
  default: () => ({
    handlePropertyItemUpdate: vi.fn(),
    handlePropertyItemAdd: vi.fn(),
    handlePropertyItemDelete: vi.fn(),
    handlePropertyItemMove: vi.fn()
  })
}));

describe("PropertyItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders string field correctly", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "stringField",
          type: "string",
          title: "String Field"
        }
      ],
      fields: [
        {
          id: "stringField",
          type: "string",
          value: "test value"
        }
      ],
      representativeField: "stringField"
    } as unknown as Item;

    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText("String Field")).toBeInTheDocument();
  });

  test("renders number field correctly", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "numberField",
          type: "number",
          title: "Number Field",
          suffix: "px"
        }
      ],
      fields: [
        {
          id: "numberField",
          type: "number",
          value: 42
        }
      ],
      representativeField: "numberField"
    } as unknown as Item;
    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText("Number Field")).toBeInTheDocument();
  });

  test("renders boolean field correctly", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "boolField",
          type: "bool",
          title: "Boolean Field"
        }
      ],
      fields: [
        {
          id: "boolField",
          type: "bool",
          value: true
        }
      ],
      representativeField: "boolField"
    } as unknown as Item;
    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText("Boolean Field")).toBeInTheDocument();
  });

  test("handles conditional field visibility", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "condition",
          type: "bool",
          title: "Condition Field"
        },
        {
          id: "dependent",
          type: "string",
          title: "Dependent Field",
          only: {
            field: "condition",
            value: true
          }
        }
      ],
      fields: [
        {
          id: "condition",
          type: "bool",
          value: false
        }
      ],
      representativeField: "condition"
    } as unknown as Item;
    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText("Condition Field")).toBeInTheDocument();
    expect(screen.queryByText("Dependent Field")).not.toBeInTheDocument();
  });

  test("renders list items correctly", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "field1",
          type: "string",
          title: "Field 1"
        }
      ],
      items: [
        {
          id: "item1",
          fields: [
            {
              id: "field1",
              type: "string",
              value: "Value 1"
            }
          ]
        },
        {
          id: "item2",
          fields: [
            {
              id: "field1",
              type: "string",
              value: "Value 2"
            }
          ]
        }
      ],
      representativeField: "field1"
    } as unknown as Item;
    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText("Value 1")).toBeInTheDocument();
    expect(screen.getByText("Value 2")).toBeInTheDocument();
  });
});
