import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { TimePicker } from "./index";

describe("TimePicker Component", () => {
  test("renders with default props", () => {
    render(<TimePicker />);

    const input = screen.getByTestId("time-picker");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("type", "time");
  });

  test("renders with initial value", () => {
    render(<TimePicker value="13:30:00" />);

    const input = screen.getByTestId("time-picker");
    expect(input).toHaveValue("13:30:00");
  });

  test("updates when value changes", () => {
    const handleChange = vi.fn();
    render(<TimePicker onChange={handleChange} />);

    const input = screen.getByTestId("time-picker");
    fireEvent.change(input, { target: { value: "15:45:30" } });

    expect(input).toHaveValue("15:45:30");
    expect(handleChange).toHaveBeenCalledWith("15:45:30");
  });

  test("calls onBlur when focus is lost", () => {
    const handleBlur = vi.fn();
    render(<TimePicker onBlur={handleBlur} />);

    const input = screen.getByTestId("time-picker");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "09:15:00" } });
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalledWith("09:15:00");
  });

  test("renders in disabled state", () => {
    render(<TimePicker disabled />);

    const input = screen.getByTestId("time-picker");
    expect(input).toBeDisabled();
  });

  test("has min, max and step attributes", () => {
    render(<TimePicker />);

    const input = screen.getByTestId("time-picker");
    expect(input).toHaveAttribute("min", "00:00:00");
    expect(input).toHaveAttribute("max", "23:59:59");
    expect(input).toHaveAttribute("step", "1");
  });

  test("handles focus and blur events", () => {
    const mockOnBlur = vi.fn();
    const { container } = render(<TimePicker onBlur={mockOnBlur} />);

    const input = screen.getByTestId("time-picker");
    const wrapper = container.firstChild;

    // Test that components are rendered
    expect(input).toBeInTheDocument();
    expect(wrapper).toBeInTheDocument();

    // Test focus and blur event handling
    fireEvent.focus(input);
    fireEvent.blur(input);
    
    // Verify that blur callback is triggered with current value (empty string)
    expect(mockOnBlur).toHaveBeenCalledWith("");
  });
});
