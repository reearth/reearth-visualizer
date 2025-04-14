import { render, screen, fireEvent } from "@reearth/test/utils";
import { describe, it, expect, vi } from "vitest";

import NumberField from "./index";

describe("NumberField", () => {
  it("should render with title and description", () => {
    render(
      <NumberField
        title="Test Title"
        description="Test Description"
        value={10}
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("should render a number input with the correct value", () => {
    render(<NumberField value={42} onChange={() => {}} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("42");
  });

  it("should call onChange when the value changes", () => {
    const handleChange = vi.fn((_value?: number) => {});
    render(<NumberField value={0} onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "5" } });

    expect(handleChange).toBeCalledWith(5);
  });
});
