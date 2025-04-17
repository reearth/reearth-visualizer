import { render, screen, fireEvent } from "@reearth/test/utils";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import ZoomLevelField from "./index";

vi.mock("@reearth/services/theme", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...(typeof actual === "object" && actual ? actual : {}),
    styled: new Proxy(
      vi.fn().mockImplementation((Component, options) => {
        const StyledComponent = ({
          children,
          ...props
        }: React.HTMLAttributes<HTMLElement>) => {
          const filteredProps = options?.shouldForwardProp
            ? Object.fromEntries(
                Object.entries(props).filter(([key]) =>
                  options.shouldForwardProp(key)
                )
              )
            : props;

          if (typeof Component === "string") {
            return React.createElement(Component, filteredProps, children);
          }
          return <Component {...filteredProps}>{children}</Component>;
        };
        return () => StyledComponent;
      }),
      {
        get: (target, prop) => {
          if (typeof prop === "string") {
            return target.bind(null, prop);
          }
          if (typeof prop === "symbol") {
            return undefined;
          }
          return target[prop];
        }
      }
    )
  };
});

describe("ZoomLevelField", () => {
  const defaultProps = {
    title: "Zoom Level",
    description: "Set zoom level range",
    min: 0,
    max: 20,
    value: [5, 15] as [number, number],
    onChange: vi.fn()
  };

  it("renders with initial value", () => {
    render(<ZoomLevelField {...defaultProps} />);

    expect(screen.getByDisplayValue("5-15")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders with empty value", () => {
    render(
      <ZoomLevelField
        {...defaultProps}
        value={[null, null].map((v) => v ?? 0) as number[]}
      />
    );

    expect(screen.getByPlaceholderText("Not set")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("handles delete button click", () => {
    render(<ZoomLevelField {...defaultProps} />);

    const deleteButton = screen.getByRole("button", { name: "" });
    fireEvent.click(deleteButton);

    expect(defaultProps.onChange).toHaveBeenCalledWith([null, null]);
  });

  it("opens edit panel on edit button click", () => {
    render(<ZoomLevelField {...defaultProps} />);

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    expect(screen.getByText("Zoom Level Editor")).toBeInTheDocument();
  });

  it("disables delete button when value is undefined", () => {
    render(<ZoomLevelField {...defaultProps} value={undefined} />);

    const deleteButton = screen.getByRole("button", { name: "" });
    expect(deleteButton).toBeDisabled();
  });

  it("disables edit button when disabled prop is true", () => {
    render(<ZoomLevelField {...defaultProps} disabled />);

    const editButton = screen.getByText("Edit");
    expect(editButton).toBeDisabled();
  });
});
