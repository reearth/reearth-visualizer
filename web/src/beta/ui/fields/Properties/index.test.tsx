import { Item } from "@reearth/services/api/propertyApi/utils";
import React from "react";
import { describe, expect, test, vi, beforeEach } from "vitest";

import { render, screen } from "../../../../test/utils";

import PropertyItem from "./index";

// Mock hooks
vi.mock("./hooks", () => ({
  default: () => ({
    handlePropertyItemUpdate: vi.fn(),
    handlePropertyItemAdd: vi.fn(),
    handlePropertyItemDelete: vi.fn(),
    handlePropertyItemMove: vi.fn()
  })
}));

vi.mock("@reearth/services/theme", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...(typeof actual === "object" && actual ? actual : {}),
    styled: new Proxy(
      vi.fn().mockImplementation((Component) => {
        const StyledComponent = ({
          children,
          ...props
        }: React.HTMLAttributes<HTMLElement>) => {
          if (typeof Component === "string") {
            return React.createElement(Component, props, children);
          }
          return <Component {...props}>{children}</Component>;
        };
        return () => StyledComponent;
      }),
      {
        get: (target, prop) => {
          if (typeof prop === "string") {
            return target.bind(null, prop);
          }
          return typeof prop === "string"
            ? (target as unknown as Record<string, unknown>)[prop]
            : undefined;
        }
      }
    ),
    css: vi.fn(),
    useTheme: () => ({
      spacing: {
        micro: 2,
        smallest: 4,
        small: 8,
        normal: 12,
        large: 16,
        largest: 20,
        super: 24
      },
      icon: {
        small: 16,
        medium: 24,
        large: 32
      },
      radius: {
        small: 4,
        medium: 8,
        large: 16
      },
      shadow: {
        sm: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        md: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        lg: "0px 8px 16px rgba(0, 0, 0, 0.1)"
      },
      fonts: {
        main: "'Roboto', sans-serif"
      },
      scrollBar: {
        width: 8
      },
      zIndexes: {
        base: 0,
        dropdown: 100,
        modal: 200,
        tooltip: 300
      },
      bg: {
        transparentBlack: "rgba(0, 0, 0, 0.5)",
        base: "#ffffff",
        0: "#f8f9fa",
        1: "#f1f3f5",
        2: "#e9ecef",
        3: "#dee2e6",
        4: "#ced4da"
      },
      select: {
        weaker: "#e9ecef",
        weak: "#adb5bd",
        main: "#6c757d",
        strong: "#495057"
      },
      item: {
        default: "#ffffff",
        hover: "#f8f9fa"
      },
      outline: {
        weakest: "#f1f3f5",
        weaker: "#e9ecef",
        weak: "#dee2e6",
        main: "#ced4da"
      },
      primary: {
        main: "#007bff",
        weak: "#b8daff",
        weakest: "#e6f2ff",
        strong: "#0056b3"
      },
      content: {
        withBackground: "#ffffff",
        strong: "#212529",
        main: "#343a40",
        weak: "#6c757d",
        weaker: "#adb5bd"
      },
      secondary: {
        weak: "#e9ecef",
        main: "#6c757d",
        strong: "#343a40"
      },
      dangerous: {
        main: "#dc3545",
        weak: "#f8d7da",
        strong: "#bd2130"
      },
      warning: {
        main: "#ffc107",
        weak: "#fff3cd",
        weakest: "#fff9e6"
      },
      relative: {
        lightest: "#ffffff",
        lighter: "#f8f9fa",
        light: "#e9ecef",
        dim: "#6c757d",
        dark: "#343a40",
        darker: "#212529",
        darkest: "#000000"
      },
      placeHolder: {
        main_1: "#ced4da",
        main_2: "#adb5bd"
      },
      colorSchema: "light",
      publish: {
        main: "#007bff"
      }
    })
  };
});

// Mock i18n
vi.mock("@reearth/services/i18n", () => ({
  useT: () => (key: string) => key,
  Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>
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
