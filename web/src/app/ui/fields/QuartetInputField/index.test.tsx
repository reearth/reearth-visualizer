import { render, screen, fireEvent } from "@reearth/test/utils";
import { describe, it, expect, vi } from "vitest";

import QuartetInputField, { QuartetInputFieldProps } from "./index";

describe("QuartetInputField", () => {
  const defaultProps: QuartetInputFieldProps = {
    title: "Test Title",
    description: "Test Description",
    values: [1, 2, 3, 4],
    placeholders: [
      "Placeholder 1",
      "Placeholder 2",
      "Placeholder 3",
      "Placeholder 4"
    ],
    content: ["Content 1", "Content 2", "Content 3", "Content 4"],
    onChange: vi.fn(),
    onBlur: vi.fn()
  };

  it("renders correctly with given props", () => {
    render(<QuartetInputField {...defaultProps} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();

    defaultProps.placeholders?.forEach((placeholder, _index) => {
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    });

    defaultProps.content?.forEach((content) => {
      expect(screen.getByText(content)).toBeInTheDocument();
    });
  });

  it("calls onChange when input values change", () => {
    render(<QuartetInputField {...defaultProps} />);

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "10" } });

    expect(defaultProps.onChange).toHaveBeenCalledWith([10, 2, 3, 4]);
  });

  it("calls onBlur when input loses focus", () => {
    render(<QuartetInputField {...defaultProps} />);

    const inputs = screen.getAllByRole("textbox");
    fireEvent.blur(inputs[0]);

    expect(defaultProps.onBlur).toHaveBeenCalledWith([1, 2, 3, 4]);
  });

  it("updates input values when props change", () => {
    const { rerender } = render(<QuartetInputField {...defaultProps} />);

    rerender(<QuartetInputField {...defaultProps} values={[5, 6, 7, 8]} />);

    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveValue("5");
    expect(inputs[1]).toHaveValue("6");
    expect(inputs[2]).toHaveValue("7");
    expect(inputs[3]).toHaveValue("8");
  });
});
