import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { TextArea } from "./index";

describe("TextArea Component", () => {
  test("renders with default props", () => {
    render(<TextArea />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue("");
  });

  test("renders with initial value", () => {
    render(<TextArea value="Initial text" />);

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("Initial text");
  });

  test("renders with placeholder", () => {
    render(<TextArea placeholder="Enter text here" />);

    const textarea = screen.getByPlaceholderText("Enter text here");
    expect(textarea).toBeInTheDocument();
  });

  test("updates when value changes", () => {
    const handleChange = vi.fn();
    render(<TextArea onChange={handleChange} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "New text" } });

    expect(textarea).toHaveValue("New text");
    expect(handleChange).toHaveBeenCalledWith("New text");
  });

  test("calls onBlur when focus is lost", () => {
    const handleBlur = vi.fn();
    render(<TextArea onBlur={handleBlur} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.focus(textarea);
    fireEvent.change(textarea, { target: { value: "Text before blur" } });
    fireEvent.blur(textarea);

    expect(handleBlur).toHaveBeenCalledWith("Text before blur");
  });

  test("shows character count when counter is enabled", () => {
    render(<TextArea value="Hello" counter />);

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  test("shows character count with max length when both are enabled", () => {
    render(<TextArea value="Hello" counter maxLength={10} />);

    expect(screen.getByText("5 / 10")).toBeInTheDocument();
  });
});
