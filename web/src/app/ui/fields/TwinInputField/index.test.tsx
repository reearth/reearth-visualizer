import { ThemeProvider } from "@emotion/react";
import darkTheme from "@reearth/services/theme/reearthTheme/darkTheme";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import TwinInputField, { TwinInputFieldProps } from "./index";

const renderComponent = (props: Partial<TwinInputFieldProps> = {}) => {
  const defaultProps: TwinInputFieldProps = {
    title: "Test Title",
    description: "Test Description",
    values: [0, 0],
    placeholders: ["Placeholder 1", "Placeholder 2"],
    onChange: vi.fn(),
    onBlur: vi.fn()
  };

  return render(
    <ThemeProvider theme={darkTheme}>
      <TwinInputField {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe("TwinInputField", () => {
  it("renders correctly with title and description", () => {
    renderComponent();

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("calls onChange when input values change", () => {
    const onChange = vi.fn();
    renderComponent({ onChange });

    const input = screen.getByPlaceholderText("Placeholder 1");
    fireEvent.change(input, { target: { value: "5" } });

    expect(onChange).toHaveBeenCalledWith([5, 0]);
  });

  it("calls onBlur when input loses focus", () => {
    const onBlur = vi.fn();
    renderComponent({ onBlur });

    const input = screen.getByPlaceholderText("Placeholder 1");
    fireEvent.blur(input);

    expect(onBlur).toHaveBeenCalledWith([0, 0]);
  });

  it("displays placeholders and content correctly", () => {
    renderComponent({
      placeholders: ["Placeholder 1", "Placeholder 2"],
      content: ["Content 1", "Content 2"]
    });

    expect(screen.getByPlaceholderText("Placeholder 1")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Placeholder 2")).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeInTheDocument();
    expect(screen.getByText("Content 2")).toBeInTheDocument();
  });
});
