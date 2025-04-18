import { render, screen, fireEvent } from "@reearth/test/utils";
import React from "react";
import { vi, describe, test, expect, beforeEach } from "vitest";

import { NumberInput } from "./index";

describe("NumberInput Component", () => {
  const mockOnChange = vi.fn();
  const mockOnBlur = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders with initial value", () => {
    render(<NumberInput value={42} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("42");
  });

  test("calls onChange with number value on valid input", () => {
    render(<NumberInput onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "123" } });

    expect(input).toHaveValue("123");
    expect(mockOnChange).toHaveBeenCalledWith(123);
  });

  test("handles decimal and negative input", () => {
    render(<NumberInput onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "12.34" } });
    expect(mockOnChange).toHaveBeenCalledWith(12.34);

    fireEvent.change(input, { target: { value: "-42" } });
    expect(mockOnChange).toHaveBeenCalledWith(-42);
  });

  test("rejects non-numeric input", () => {
    render(<NumberInput onChange={mockOnChange} value={123} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "123abc" } });

    expect(input).toHaveValue("123");
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test("applies min and max constraints", () => {
    render(<NumberInput onChange={mockOnChange} min={10} max={100} />);

    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "5" } });
    expect(input).toHaveValue("10");
    expect(mockOnChange).toHaveBeenLastCalledWith(10);

    fireEvent.change(input, { target: { value: "150" } });
    expect(input).toHaveValue("100");
    expect(mockOnChange).toHaveBeenLastCalledWith(100);
  });

  test("formats number on blur", () => {
    render(<NumberInput onBlur={mockOnBlur} />);

    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "007.50" } });
    fireEvent.blur(input);

    expect(input).toHaveValue("7.5");
    expect(mockOnBlur).toHaveBeenCalledWith(7.5);
  });

  test("handles Enter key to trigger blur", () => {
    render(<NumberInput onBlur={mockOnBlur} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "42" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);
    expect(mockOnBlur).toHaveBeenCalledWith(42);
  });

  test("updates when value prop changes", () => {
    const { rerender } = render(<NumberInput value={42} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("42");

    rerender(<NumberInput value={100} />);
    expect(input).toHaveValue("100");
  });
});
