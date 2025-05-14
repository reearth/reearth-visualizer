import { render, screen, fireEvent } from "@reearth/test/utils";
import { describe, expect, it, vi } from "vitest";

import SpacingField from "./index";

describe("SpacingField", () => {
  it("renders with default values", () => {
    render(<SpacingField title="Test Title" description="Test Description" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getAllByRole("textbox").length).toBe(4);
  });

  it("calls onChange when a value is updated", () => {
    const handleChange = vi.fn();
    render(
      <SpacingField
        title="Test Title"
        value={{ top: 10, left: 20, right: 30, bottom: 40 }}
        onChange={handleChange}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "15" } });

    expect(handleChange).toHaveBeenCalledWith({
      top: 15,
      left: 20,
      right: 30,
      bottom: 40
    });
  });

  it("calls onBlur when an input loses focus", () => {
    const handleBlur = vi.fn();
    render(
      <SpacingField
        title="Test Title"
        value={{ top: 10, left: 20, right: 30, bottom: 40 }}
        onBlur={handleBlur}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    fireEvent.blur(inputs[0]);

    expect(handleBlur).toHaveBeenCalledWith({
      top: 10,
      left: 20,
      right: 30,
      bottom: 40
    });
  });
});
