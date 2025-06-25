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

  test("renders camera field correctly", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "cameraField",
          type: "camera",
          title: "Camera Field"
        }
      ],
      fields: [
        {
          id: "cameraField",
          type: "camera",
          value: { lat: 35.6895, lng: 139.6917 }
        }
      ],
      representativeField: "cameraField"
    } as unknown as Item;

    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText("Camera Field")).toBeInTheDocument();
  });

  test("renders latlng field correctly", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "latlngField",
          type: "latlng",
          title: "LatLng Field"
        }
      ],
      fields: [
        {
          id: "latlngField",
          type: "latlng",
          value: { lat: 40.7128, lng: -74.006 }
        }
      ],
      representativeField: "latlngField"
    } as unknown as Item;

    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText("LatLng Field")).toBeInTheDocument();
  });

  test("handles invalid field type gracefully", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "invalidField",
          type: "invalid",
          title: "Invalid Field"
        }
      ],
      fields: [
        {
          id: "invalidField",
          type: "invalid",
          value: "some value"
        }
      ],
      representativeField: "invalidField"
    } as unknown as Item;

    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText(/Invalid Field/)).toBeInTheDocument();
  });

  test("renders slider field correctly", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "sliderField",
          type: "number",
          title: "Slider Field",
          ui: "slider",
          min: 0,
          max: 100
        }
      ],
      fields: [
        {
          id: "sliderField",
          type: "number",
          value: 50
        }
      ],
      representativeField: "sliderField"
    } as unknown as Item;

    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText("Slider Field")).toBeInTheDocument();
  });

  test("renders color field correctly", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "colorField",
          type: "string",
          title: "Color Field",
          ui: "color"
        }
      ],
      fields: [
        {
          id: "colorField",
          type: "string",
          value: "#ff0000"
        }
      ],
      representativeField: "colorField"
    } as unknown as Item;

    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText("Color Field")).toBeInTheDocument();
  });

  test("renders textarea field correctly", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "textareaField",
          type: "string",
          title: "Textarea Field",
          ui: "multiline"
        }
      ],
      fields: [
        {
          id: "textareaField",
          type: "string",
          value: "This is a test textarea."
        }
      ],
      representativeField: "textareaField"
    } as unknown as Item;

    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText("Textarea Field")).toBeInTheDocument();
  });

  test("renders select field correctly", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "selectField",
          type: "string",
          title: "Select Field",
          choices: [
            { key: "option1", label: "Option 1" },
            { key: "option2", label: "Option 2" }
          ]
        }
      ],
      fields: [
        {
          id: "selectField",
          type: "string",
          value: "option1"
        }
      ],
      representativeField: "selectField"
    } as unknown as Item;

    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText("Select Field")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  test("renders range field correctly", () => {
    const mockItem = {
      id: "1",
      schemaGroup: "group1",
      schemaFields: [
        {
          id: "rangeField",
          type: "array",
          title: "Range Field",
          ui: "range",
          min: 0,
          max: 100
        }
      ],
      fields: [
        {
          id: "rangeField",
          type: "array",
          value: [10, 90]
        }
      ],
      representativeField: "rangeField"
    } as unknown as Item;

    render(<PropertyItem propertyId="testId" item={mockItem} />);
    expect(screen.getByText("Range Field")).toBeInTheDocument();
  });
});
