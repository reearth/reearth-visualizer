import { render, screen, fireEvent } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import Text from "./index";

describe("Text Component", () => {
  test("renders children correctly", () => {
    render(<Text size="body">Text content</Text>);

    expect(screen.getByText("Text content")).toBeInTheDocument();
  });

  test("applies correct typography based on size prop", () => {
    render(<Text size="body">Body text</Text>);

    const textElement = screen.getByText("Body text");
    expect(textElement.tagName).toBe("P");
  });

  test("applies custom color when provided", () => {
    render(
      <Text size="body" color="#ff0000">
        Custom color
      </Text>
    );

    const textElement = screen.getByText("Custom color");
    expect(textElement).not.toHaveStyle("color: rgb(224, 224, 224);");
    expect(textElement).toHaveStyle({
      color: "rgb(255, 0, 0)"
    });
  });

  test("applies default theme color when no color is provided", () => {
    render(<Text size="body">Default color</Text>);

    const textElement = screen.getByText("Default color");
    expect(textElement).toHaveStyle("color: rgb(224, 224, 224);");
  });

  test("applies custom weight", () => {
    render(
      <Text size="body" weight="bold">
        Bold text
      </Text>
    );

    const textElement = screen.getByText("Bold text");
    expect(textElement).toHaveStyle("font-weight: bold");
  });

  test("applies additional style properties", () => {
    render(
      <Text
        size="body"
        otherProperties={{
          textAlign: "center",
          textDecoration: "underline"
        }}
      >
        Styled text
      </Text>
    );

    const textElement = screen.getByText("Styled text");
    expect(textElement).toHaveStyle("text-align: center");
    expect(textElement).toHaveStyle("text-decoration: underline");
  });

  test("handles click events", () => {
    const handleClick = vi.fn();
    render(
      <Text size="body" onClick={handleClick}>
        Clickable text
      </Text>
    );

    const textElement = screen.getByText("Clickable text");
    fireEvent.click(textElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("handles double click events", () => {
    const handleDoubleClick = vi.fn();
    render(
      <Text size="body" onDoubleClick={handleDoubleClick}>
        Double-clickable text
      </Text>
    );

    const textElement = screen.getByText("Double-clickable text");
    fireEvent.doubleClick(textElement);

    expect(handleDoubleClick).toHaveBeenCalledTimes(1);
  });

  test("applies custom class name", () => {
    render(
      <Text size="body" className="custom-class">
        Classy text
      </Text>
    );

    const textElement = screen.getByText("Classy text");
    expect(textElement).toHaveClass("custom-class");
  });

  test("applies user-select style property", () => {
    render(<Text size="body">Unselectable text</Text>);

    const textElement = screen.getByText("Unselectable text");
    expect(textElement).toHaveStyle("user-select: break");
  });
});
