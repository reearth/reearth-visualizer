import { render, screen, fireEvent } from "@reearth/test/utils";
import { vi, describe, test, expect, beforeEach } from "vitest";

import { DatePicker } from "./index";

describe("DatePicker Component", () => {
  const mockOnChange = vi.fn();
  const mockOnBlur = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders with default props", () => {
    render(<DatePicker />);

    const input = screen.getByTestId("date-picker-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "date");
    expect(input).toHaveValue("");
  });

  test("renders with provided value", () => {
    const testDate = "2023-05-15";
    render(<DatePicker value={testDate} />);

    const input = screen.getByTestId("date-picker-input");
    expect(input).toHaveValue(testDate);
  });

  test("updates internal state when value prop changes", () => {
    const initialDate = "2023-05-15";
    const newDate = "2023-06-20";

    const { rerender } = render(<DatePicker value={initialDate} />);

    const input = screen.getByTestId("date-picker-input");
    expect(input).toHaveValue(initialDate);

    rerender(<DatePicker value={newDate} />);
    expect(input).toHaveValue(newDate);
  });

  test("calls onChange when input value changes", () => {
    render(<DatePicker onChange={mockOnChange} />);

    const input = screen.getByTestId("date-picker-input");
    const newDate = "2023-05-15";

    fireEvent.change(input, { target: { value: newDate } });

    expect(mockOnChange).toHaveBeenCalledWith(newDate);
    expect(input).toHaveValue(newDate);
  });

  test("calls onBlur when input loses focus", async () => {
    render(
      <DatePicker
        value="2023-05-15"
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const input = screen.getByTestId("date-picker-input");

    fireEvent.focus(input);

    fireEvent.blur(input);

    expect(mockOnBlur).toHaveBeenCalledWith("2023-05-15");
  });

  test("handles focus and blur events", async () => {
    const mockOnBlur = vi.fn();
    render(<DatePicker value="2023-05-15" onBlur={mockOnBlur} />);

    const input = screen.getByTestId("date-picker-input");
    const wrapper = input.parentElement;

    // Test that wrapper and input are rendered
    expect(wrapper).toBeInTheDocument();
    expect(input).toBeInTheDocument();

    // Test focus event handling
    fireEvent.focus(input);

    // Test blur event handling - this should trigger the onBlur callback
    fireEvent.blur(input);
    expect(mockOnBlur).toHaveBeenCalledWith("2023-05-15");
  });

  test("disables input when disabled prop is true", () => {
    render(<DatePicker disabled value="2023-05-15" />);

    const input = screen.getByTestId("date-picker-input");
    expect(input).toBeDisabled();
  });
});
