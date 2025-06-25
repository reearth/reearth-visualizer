import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { Radio } from "./index";

describe("Radio Component", () => {
  test("renders with label", () => {
    render(<Radio label="Option 1" />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByRole("radio")).toBeInTheDocument();
  });

  test("renders in checked state", () => {
    render(<Radio label="Option 1" checked />);

    const radioInput = screen.getByRole("radio");
    expect(radioInput).toBeChecked();
  });

  test("renders in disabled state", () => {
    render(<Radio label="Option 1" disabled />);

    const radioInput = screen.getByRole("radio");
    expect(radioInput).toBeDisabled();
  });

  test("calls onChange when clicked", () => {
    const handleChange = vi.fn();
    render(<Radio value="value1" label="Option 1" onChange={handleChange} />);

    const radioLabel = screen.getByText("Option 1");
    fireEvent.click(radioLabel);

    expect(handleChange).toHaveBeenCalledWith("value1");
  });

  test("does not call onChange when disabled", () => {
    const handleChange = vi.fn();
    render(
      <Radio value="value1" label="Option 1" onChange={handleChange} disabled />
    );

    const radioLabel = screen.getByText("Option 1");
    fireEvent.click(radioLabel);

    expect(handleChange).not.toHaveBeenCalled();
  });

  test("renders with additional content when provided", () => {
    render(<Radio label="Option 1" content={<div>Additional content</div>} />);

    expect(screen.getByText("Additional content")).toBeInTheDocument();
  });
});
