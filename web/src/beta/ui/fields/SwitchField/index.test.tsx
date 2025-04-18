import { render, screen, fireEvent } from "@reearth/test/utils";
import { describe, expect, it, vi } from "vitest";

import SwitchField from "./index";

describe("SwitchField", () => {
  it("renders with default values", () => {
    render(<SwitchField title="Test Title" description="Test Description" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByTestId("switcher")).toBeInTheDocument();
  });

  it("calls onChange when toggled", () => {
    const handleChange = vi.fn();
    render(<SwitchField title="Test Title" onChange={handleChange} />);

    const switchElement = screen.getByTestId("switcher");
    fireEvent.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when disabled", () => {
    const handleChange = vi.fn();
    render(<SwitchField title="Test Title" disabled onChange={handleChange} />);

    const switchElement = screen.getByTestId("switcher");
    fireEvent.click(switchElement);

    expect(handleChange).not.toHaveBeenCalled();
  });
});
