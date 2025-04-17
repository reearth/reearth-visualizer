import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import RadioGroupField from "./index";

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

describe("RadioGroupField", () => {
  it("should render options correctly", () => {
    render(
      <RadioGroupField
        options={[
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" }
        ]}
      />
    );

    const input1 = screen.getAllByRole("radio")[0];
    const input2 = screen.getAllByRole("radio")[1];
    expect(input1.getAttribute("type")).toBe("radio");
    expect(input2.getAttribute("type")).toBe("radio");
    expect(input1).toHaveAttribute("value", "1");
    expect(input2).toHaveAttribute("value", "2");
  });

  it("should call onChange when an option is selected", () => {
    const handleChange = vi.fn();
    render(
      <RadioGroupField
        options={[
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" }
        ]}
        onChange={handleChange}
      />
    );

    const input1 = screen.getAllByRole("radio")[0];
    fireEvent.click(input1);

    expect(handleChange).toHaveBeenCalledWith("1");
  });
});
