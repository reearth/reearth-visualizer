import { render, act } from "@reearth/test/utils";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import SelectorField, { SelectorFieldProps } from "./index";

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

describe("SelectField", () => {
  const defaultProps: SelectorFieldProps = {
    title: "Test Title",
    description: "Test Description",
    options: [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" }
    ],
    value: "1",
    onChange: vi.fn()
  };

  it("should render with title and description", () => {
    const { getByText } = render(<SelectorField {...defaultProps} />);

    expect(getByText("Test Title")).toBeInTheDocument();
    expect(getByText("Test Description")).toBeInTheDocument();
  });

  it("should render options in the selector", async () => {
    const { getByTestId, findAllByRole } = render(
      <SelectorField {...defaultProps} />
    );

    const dropdownTrigger = getByTestId("select-input");
    act(() => {
      dropdownTrigger.click();
    });

    const options = await findAllByRole("option");

    expect(options).toHaveLength(2);
  });

  it("should call onChange when an option is selected", async () => {
    const onChangeMock = vi.fn();
    const { getByTestId, findByRole } = render(
      <SelectorField {...defaultProps} onChange={onChangeMock} />
    );

    const dropdownTrigger = getByTestId("select-input");
    act(() => {
      dropdownTrigger.click();
    });

    const option = await findByRole("option", { name: "Option 2" });
    act(() => {
      option.click();
    });

    expect(onChangeMock).toHaveBeenCalledWith("2");
  });
});
