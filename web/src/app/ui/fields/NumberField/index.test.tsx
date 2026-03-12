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

  describe("onChangeComplete normalization", () => {
    it("should not call onChangeComplete when string value equals number value", () => {
      const handleChangeComplete = vi.fn();
      render(<NumberField value="123" onChangeComplete={handleChangeComplete} />);

      const input = screen.getByRole("textbox");
      // User types the same value (as number)
      fireEvent.change(input, { target: { value: "123" } });
      fireEvent.blur(input);

      // Should NOT trigger because "123" (string) equals 123 (number) after normalization
      expect(handleChangeComplete).not.toHaveBeenCalled();
    });

    it("should call onChangeComplete when numeric values are different", () => {
      const handleChangeComplete = vi.fn();
      render(<NumberField value={123} onChangeComplete={handleChangeComplete} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "456" } });
      fireEvent.blur(input);

      expect(handleChangeComplete).toHaveBeenCalledWith(456);
    });

    it("should call onChangeComplete when string value differs from number value", () => {
      const handleChangeComplete = vi.fn();
      render(<NumberField value="100" onChangeComplete={handleChangeComplete} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "200" } });
      fireEvent.blur(input);

      expect(handleChangeComplete).toHaveBeenCalledWith(200);
    });

    it("should handle empty string as undefined", () => {
      const handleChangeComplete = vi.fn();
      render(<NumberField value="" onChangeComplete={handleChangeComplete} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.blur(input);

      // Empty string should normalize to undefined, no change
      expect(handleChangeComplete).not.toHaveBeenCalled();
    });

    it("should trigger change from empty string to number", () => {
      const handleChangeComplete = vi.fn();
      render(<NumberField value="" onChangeComplete={handleChangeComplete} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "42" } });
      fireEvent.blur(input);

      expect(handleChangeComplete).toHaveBeenCalledWith(42);
    });

    it("should trigger change from number to undefined (clearing)", () => {
      const handleChangeComplete = vi.fn();
      render(<NumberField value={42} onChangeComplete={handleChangeComplete} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.blur(input);

      expect(handleChangeComplete).toHaveBeenCalledWith(undefined);
    });

    it("should always emit number or undefined, never string", () => {
      const handleChangeComplete = vi.fn();
      render(<NumberField value="999" onChangeComplete={handleChangeComplete} />);

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "888" } });
      fireEvent.blur(input);

      // Should emit number 888, not string "888"
      expect(handleChangeComplete).toHaveBeenCalledWith(888);
      expect(typeof handleChangeComplete.mock.calls[0][0]).toBe("number");
    });

    it("should not trigger update when value changes from number to equivalent string", () => {
      const handleChangeComplete = vi.fn();
      const { rerender } = render(
        <NumberField value={50} onChangeComplete={handleChangeComplete} />
      );

      // Rerender with string version of same number
      rerender(<NumberField value="50" onChangeComplete={handleChangeComplete} />);

      const input = screen.getByRole("textbox");
      fireEvent.blur(input);

      // Should not trigger because 50 equals "50" after normalization
      expect(handleChangeComplete).not.toHaveBeenCalled();
    });
  });
});
