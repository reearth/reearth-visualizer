import { render, screen, fireEvent } from "@reearth/test/utils";
import { describe, it, expect, vi } from "vitest";

import InputField from "./index";

describe("InputField", () => {
  it("should render with title and description", () => {
    render(
      <InputField
        title="Test Title"
        description="Test Description"
        value="Test Value"
        placeholder="Test Placeholder"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Test Placeholder")).toHaveValue(
      "Test Value"
    );
  });

  it("should call onChange when input value changes", () => {
    const handleChange = vi.fn();

    render(
      <InputField
        title="Test Title"
        description="Test Description"
        value=""
        placeholder="Test Placeholder"
        onChange={handleChange}
      />
    );

    const input = screen.getByPlaceholderText("Test Placeholder");
    fireEvent.change(input, { target: { value: "New Value" } });

    expect(handleChange).toHaveBeenCalled();
  });

  it("should render as disabled when disabled prop is true", () => {
    render(
      <InputField
        title="Test Title"
        description="Test Description"
        value=""
        placeholder="Test Placeholder"
        disabled
      />
    );

    const input = screen.getByPlaceholderText("Test Placeholder");
    expect(input).toBeDisabled();
  });
});
