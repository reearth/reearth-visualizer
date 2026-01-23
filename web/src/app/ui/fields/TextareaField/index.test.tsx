import { fireEvent, render, screen } from "@reearth/test/utils";
import { describe, it, expect, vi } from "vitest";

import TextAreaField from "./index";

describe("TextAreaField", () => {
  it("should render with title and description", () => {
    render(
      <TextAreaField
        title="Test Title"
        description="Test Description"
        value="Test Value"
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Value")).toBeInTheDocument();
  });

  it("should call onChange when value changes", () => {
    const handleChange = vi.fn();
    render(
      <TextAreaField
        title="Test Title"
        description="Test Description"
        value="Test Value"
        onChange={handleChange}
      />
    );

    const textarea = screen.getByDisplayValue(
      "Test Value"
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "New Value" } });
    expect(textarea.value).toBe("New Value");

    expect(handleChange).toHaveBeenCalled();
  });

  it("should render without description if not provided", () => {
    render(
      <TextAreaField
        title="Test Title"
        value="Test Value"
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.queryByText("Test Description")).not.toBeInTheDocument();
  });

  it("should render with a placeholder", () => {
    render(
      <TextAreaField
        title="Test Title"
        placeholder="Enter text here"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByPlaceholderText("Enter text here")).toBeInTheDocument();
  });
});
