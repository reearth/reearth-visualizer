import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { TextInput } from "./index";

describe("TextInput Component", () => {
  test("renders with default props", () => {
    render(<TextInput />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  test("renders with initial value", () => {
    render(<TextInput value="Initial text" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("Initial text");
  });

  test("renders with placeholder", () => {
    render(<TextInput placeholder="Enter text here" />);

    const input = screen.getByPlaceholderText("Enter text here");
    expect(input).toBeInTheDocument();
  });

  test("updates when value changes", () => {
    const handleChange = vi.fn();
    render(<TextInput onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "New text" } });

    expect(input).toHaveValue("New text");
    expect(handleChange).toHaveBeenCalledWith("New text");
  });

  test("calls onBlur when focus is lost", () => {
    const handleBlur = vi.fn();
    render(<TextInput onBlur={handleBlur} />);

    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Text before blur" } });
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalledWith("Text before blur");
  });

  test("limits input when maxLength is set", () => {
    render(<TextInput maxLength={5} />);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "123456" } });

    expect(input).toHaveAttribute("maxLength", "5");
  });

  test("renders in disabled state", () => {
    render(<TextInput disabled />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  test("blurs on Enter key press", () => {
    const handleBlur = vi.fn();
    render(<TextInput onBlur={handleBlur} />);

    const input = screen.getByRole("textbox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Text value" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalledWith("Text value");
  });

  test("calls onKeyDown when key is pressed", () => {
    const handleKeyDown = vi.fn();
    render(<TextInput onKeyDown={handleKeyDown} />);

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "A" });

    expect(handleKeyDown).toHaveBeenCalled();
  });

  test("renders actions when provided", () => {
    const TestAction = () => <span>Action</span>;
    render(<TextInput actions={[<TestAction key="action" />]} />);

    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});
