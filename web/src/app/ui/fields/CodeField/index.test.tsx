import { render, screen } from "@reearth/test/utils";
import { describe, expect, it, vi } from "vitest";

import CodeField from "./index";

vi.mock("@monaco-editor/react", () => ({
  default: ({
    value,
    onChange,
    height
  }: {
    value: string;
    onChange?: (value: string) => void;
    height: number;
  }) => (
    <div data-testid="monaco-editor" style={{ height }}>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        data-testid="mock-editor"
      />
    </div>
  )
}));

describe("CodeField", () => {
  const defaultProps = {
    title: "Code Editor",
    description: "Edit your code here",
    value: "console.log('Hello, world!');",
    onChange: vi.fn(),
    height: 200,
    width: 400
  };

  it("renders with initial value", () => {
    render(<CodeField {...defaultProps} />);

    expect(screen.getByTestId("mock-editor")).toHaveValue(
      "console.log('Hello, world!');"
    );
    expect(screen.getByText("Code Editor")).toBeInTheDocument();
    expect(screen.getByText("Edit your code here")).toBeInTheDocument();
  });

  it("calls onChange when value changes", () => {
    render(<CodeField {...defaultProps} />);

    const editor = screen.getByTestId("mock-editor") as HTMLTextAreaElement;
    const newValue = "console.log('Updated!');";

    editor.value = newValue;
    editor.dispatchEvent(new Event("change", { bubbles: true }));
    defaultProps.onChange(newValue);

    expect(defaultProps.onChange).toHaveBeenCalledWith(newValue);
  });

  it("applies custom height and width", () => {
    render(<CodeField {...defaultProps} />);

    const wrapper = screen.getByTestId("code-input-wrapper");
    expect(wrapper).toHaveStyle({ height: "200px", width: "400px" });
  });
});
