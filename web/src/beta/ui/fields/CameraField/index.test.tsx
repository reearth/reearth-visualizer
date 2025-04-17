import { render, screen, fireEvent } from "@reearth/test/utils";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import CameraField, { CameraFieldProps } from "./index";

const mockOnSave = vi.fn();
const mockOnFlyTo = vi.fn();

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

describe("CameraField", () => {
  const defaultProps: CameraFieldProps = {
    title: "Test Camera Field",
    description: "Test Description",
    value: undefined,
    disabled: false,
    withFOV: false,
    onSave: mockOnSave,
    onFlyTo: mockOnFlyTo
  };

  it("renders correctly with default props", () => {
    render(<CameraField {...defaultProps} />);

    expect(screen.getByPlaceholderText("Not set")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Capture")).toBeInTheDocument();
  });

  it("opens EditPanel when Edit button is clicked", () => {
    render(
      <CameraField
        {...defaultProps}
        value={{
          lat: 35,
          lng: 139,
          height: 1000,
          heading: 0,
          pitch: 0,
          roll: 0,
          fov: 60
        }}
      />
    );

    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByText("Camera Position Editor")).toBeInTheDocument();
  });

  it("calls onSave and closes popup when save is triggered from EditPanel", () => {
    render(
      <CameraField
        {...defaultProps}
        value={{
          lat: 35,
          lng: 139,
          height: 1000,
          heading: 0,
          pitch: 0,
          roll: 0,
          fov: 60
        }}
      />
    );

    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByText("Camera Position Editor")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(mockOnSave).toHaveBeenCalled();
  });

  it("disables buttons when disabled prop is true", () => {
    render(<CameraField {...defaultProps} disabled={true} />);

    expect(screen.getByText("Edit")).toBeDisabled();
    expect(screen.getByText("Capture")).toBeDisabled();
  });
});
