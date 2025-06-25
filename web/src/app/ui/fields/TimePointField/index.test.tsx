import { render, screen, fireEvent } from "@reearth/test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TimePointField from ".";

describe("TimePointField", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<TimePointField title="Test Field" />);
    expect(screen.getByText("Test Field")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("YYYY-MM-DDThh:mm:ss±hh:mm")
    ).toBeInTheDocument();
  });

  it("displays initial value", () => {
    const testValue = "2024-01-01T00:00:00+00:00";
    render(<TimePointField value={testValue} onChange={mockOnChange} />);
    expect(screen.getByDisplayValue(testValue)).toBeInTheDocument();
  });

  it("validates time format on blur", () => {
    render(<TimePointField onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText("YYYY-MM-DDThh:mm:ss±hh:mm");

    // Invalid format
    fireEvent.change(input, { target: { value: "invalid-date" } });
    fireEvent.blur(input);
    expect(mockOnChange).not.toHaveBeenCalled();

    // Valid format
    const validTime = "2024-01-01T00:00:00+00:00";
    fireEvent.change(input, { target: { value: validTime } });
    fireEvent.blur(input);
    expect(mockOnChange).toHaveBeenCalledWith(validTime);
  });

  it("opens edit panel on button click", () => {
    render(<TimePointField />);
    const setButton = screen.getByRole("button", { name: /set/i });
    fireEvent.click(setButton);
    expect(screen.getByText("Set Time")).toBeInTheDocument();
  });
});
