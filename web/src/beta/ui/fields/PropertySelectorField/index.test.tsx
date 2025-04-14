import { render, screen, fireEvent } from "@reearth/test/utils";
import { describe, it, expect, vi } from "vitest";

import PropertySelectorField from "./index";

describe("PropertySelectorField", () => {
  it("should render with title, description, and placeholder", () => {
    render(
      <PropertySelectorField
        title="Test Title"
        description="Test Description"
        value="Test Value"
        placeholder="Test Placeholder"
        options={[{ label: "Option 1", value: "option1" }]}
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Test Placeholder")).toHaveValue(
      "Test Value"
    );
  });

  it("should call onBlur when input loses focus", () => {
    const handleBlur = vi.fn();
    render(
      <PropertySelectorField
        title="Test Title"
        description="Test Description"
        value=""
        placeholder="Test Placeholder"
        onBlur={handleBlur}
        onChange={handleBlur}
      />
    );

    const input = screen.getByPlaceholderText("Test Placeholder");

    fireEvent.change(input, { target: { value: "New Value" } });
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledWith("New Value");
  });
});
