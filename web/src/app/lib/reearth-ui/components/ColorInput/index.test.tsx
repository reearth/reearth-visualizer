import {
  renderHook,
  act,
  render,
  screen,
  fireEvent,
  waitFor
} from "@reearth/test/utils";
import tinycolor from "tinycolor2";
import { vi, describe, test, expect, beforeEach } from "vitest";

import useColorPicker from "./hooks";

import { ColorInput } from "./index";

describe("useColorPicker hook", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("initializes with provided color value", () => {
    const { result } = renderHook(() =>
      useColorPicker({
        value: "#FF0000",
        alphaDisabled: true,
        onChange: mockOnChange
      })
    );

    expect(result.current.colorValue).toBe("#FF0000");
    expect(result.current.pickerColor).toEqual(tinycolor("#FF0000").toRgb());
  });

  test("updates internal state when value prop changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) =>
        useColorPicker({ value, alphaDisabled: true, onChange: mockOnChange }),
      { initialProps: { value: "#FF0000" } }
    );

    expect(result.current.colorValue).toBe("#FF0000");

    rerender({ value: "#00FF00" });

    expect(result.current.colorValue).toBe("#00FF00");
    expect(result.current.pickerColor).toEqual(tinycolor("#00FF00").toRgb());
  });

  test("handlePickerOpenChange updates open state and focus", () => {
    const { result } = renderHook(() =>
      useColorPicker({
        value: "#FF0000",
        alphaDisabled: true,
        onChange: mockOnChange
      })
    );

    expect(result.current.open).toBe(false);
    expect(result.current.isSwatchFocused).toBe(false);

    act(() => {
      result.current.handlePickerOpenChange(true);
    });

    expect(result.current.open).toBe(true);
    expect(result.current.isSwatchFocused).toBe(true);
  });

  test("handlePickerClose closes picker and removes focus", () => {
    const { result } = renderHook(() =>
      useColorPicker({
        value: "#FF0000",
        alphaDisabled: true,
        onChange: mockOnChange
      })
    );

    act(() => {
      result.current.handlePickerOpenChange(true);
    });

    expect(result.current.open).toBe(true);

    act(() => {
      result.current.handlePickerOpenChange(false);
    });

    expect(result.current.open).toBe(false);
    expect(result.current.isSwatchFocused).toBe(false);
  });

  test("handleHexInputChange updates colorValue", () => {
    const { result } = renderHook(() =>
      useColorPicker({
        value: "#FF0000",
        alphaDisabled: true,
        onChange: mockOnChange
      })
    );

    act(() => {
      result.current.handleHexInputChange("#00FF00");
    });

    expect(result.current.colorValue).toBe("#00FF00");
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test("handlePickerColorChange updates pickerColor", () => {
    const { result } = renderHook(() =>
      useColorPicker({
        value: "#FF0000",
        alphaDisabled: true,
        onChange: mockOnChange
      })
    );

    const newColor = { r: 0, g: 255, b: 0, a: 1 };

    act(() => {
      result.current.handlePickerColorChange(newColor);
    });

    expect(result.current.pickerColor).toEqual(newColor);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test("handlePickerInputChange updates specific channel", () => {
    const { result } = renderHook(() =>
      useColorPicker({
        value: "#FF0000",
        alphaDisabled: true,
        onChange: mockOnChange
      })
    );

    act(() => {
      result.current.handlePickerInputChange("b", 255);
    });

    expect(result.current.pickerColor.b).toBe(255);
    expect(result.current.pickerColor).toEqual({ r: 255, g: 0, b: 255, a: 1 });
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test("handlePickerApply applies color and calls onChange", () => {
    const { result } = renderHook(() =>
      useColorPicker({
        value: "#FF0000",
        alphaDisabled: true,
        onChange: mockOnChange
      })
    );

    act(() => {
      result.current.handlePickerColorChange({ r: 0, g: 255, b: 0, a: 1 });
    });

    act(() => {
      result.current.handlePickerApply();
    });

    expect(result.current.colorValue).toBe("#00ff00");
    expect(mockOnChange).toHaveBeenCalledWith("#00ff00");
    expect(result.current.open).toBe(false);
  });

  test("handlePickerCancel reverts to previous color", () => {
    const { result } = renderHook(() =>
      useColorPicker({
        value: "#FF0000",
        alphaDisabled: true,
        onChange: mockOnChange
      })
    );

    act(() => {
      result.current.handlePickerColorChange({ r: 0, g: 255, b: 0, a: 1 });
    });

    act(() => {
      result.current.handlePickerCancel();
    });

    expect(result.current.pickerColor).toEqual(tinycolor("#FF0000").toRgb());
    expect(result.current.open).toBe(false);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  test("includes alpha channel when alphaDisabled is false", () => {
    const { result } = renderHook(() =>
      useColorPicker({
        value: "#FF0000FF",
        alphaDisabled: false,
        onChange: mockOnChange
      })
    );

    expect(result.current.channels).toContain("a");
    expect(result.current.channels).toEqual(["r", "g", "b", "a"]);

    const newColorWithAlpha = { r: 0, g: 255, b: 0, a: 0.5 };

    act(() => {
      result.current.handlePickerColorChange(newColorWithAlpha);
      result.current.handlePickerApply();
    });

    expect(mockOnChange).toHaveBeenCalledWith("#ff0000ff");
  });
});

vi.mock("@reearth/app/lib/reearth-ui/components", async () => {
  const actual = await vi.importActual(
    "@reearth/app/lib/reearth-ui/components"
  );
  return {
    ...actual,
    PopupPanel: ({
      children,
      title,
      actions
    }: {
      children: React.ReactNode;
      title: string;
      actions: React.ReactNode;
    }) => (
      <div data-testid="popup-panel">
        <div data-testid="popup-title">{title}</div>
        <div data-testid="popup-content">{children}</div>
        <div data-testid="popup-actions">{actions}</div>
      </div>
    )
  };
});

describe("ColorInput component", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders with default props", () => {
    render(<ColorInput value="#FF0000" onChange={mockOnChange} />);

    const textInput = screen.getByPlaceholderText("#RRGGBBAA");
    expect(textInput).toHaveValue("#FF0000");
  });

  test("renders with alpha disabled", () => {
    render(
      <ColorInput
        value="#FF0000"
        alphaDisabled={true}
        onChange={mockOnChange}
      />
    );

    const textInput = screen.getByPlaceholderText("#RRGGBB");
    expect(textInput).toHaveValue("#FF0000");
  });

  test("can update color via text input", async () => {
    render(<ColorInput value="#FF0000" onChange={mockOnChange} />);

    const textInput = screen.getByPlaceholderText("#RRGGBBAA");

    fireEvent.change(textInput, { target: { value: "#00FF00" } });
    fireEvent.blur(textInput);

    expect(mockOnChange).toHaveBeenCalledWith("#00FF00");
  });

  test("clicking the swatch opens the color picker", async () => {
    render(<ColorInput value="#FF0000" onChange={mockOnChange} />);

    const swatch = screen.getByTestId("color-input-swatch");
    expect(swatch).toBeInTheDocument();
    fireEvent.click(swatch);

    await waitFor(() => {
      expect(screen.getByTestId("popup-panel")).toBeInTheDocument();
      expect(screen.getByTestId("popup-title")).toHaveTextContent(
        "Color Picker"
      );
    });
  });

  test("disables interaction when disabled prop is true", () => {
    render(
      <ColorInput value="#FF0000" disabled={true} onChange={mockOnChange} />
    );

    const textInput = screen.getByPlaceholderText("#RRGGBBAA");
    expect(textInput).toBeDisabled();
  });
});
