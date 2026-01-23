import { render, screen, fireEvent } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { Typography } from "./index";

describe("Typography Component", () => {
  test("renders children correctly", () => {
    render(<Typography size="body">Test Text</Typography>);

    expect(screen.getByText("Test Text")).toBeInTheDocument();
  });

  test("applies correct font size based on size prop", () => {
    render(<Typography size="body">Body Text</Typography>);

    const bodyElement = screen.getByText("Body Text");
    expect(bodyElement.tagName).toBe("P");
  });

  test("applies theme color when using predefined color values", () => {
    render(
      <Typography size="body" color="weak">
        Weak Text
      </Typography>
    );

    const textElement = screen.getByText("Weak Text");
    expect(textElement).toHaveStyle("color: rgb(111, 111, 111)");
  });

  test("applies custom color when provided", () => {
    render(
      <Typography size="body" color="#FF0000">
        Red Text
      </Typography>
    );

    const textElement = screen.getByText("Red Text");
    expect(textElement).toHaveStyle("color: #FF0000");
  });

  test("handles onClick events", () => {
    const handleClick = vi.fn();
    render(
      <Typography size="body" onClick={handleClick}>
        Clickable Text
      </Typography>
    );

    const textElement = screen.getByText("Clickable Text");
    fireEvent.click(textElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies additional style properties", () => {
    render(
      <Typography
        size="body"
        otherProperties={{
          textAlign: "center",
          textDecoration: "underline"
        }}
      >
        Styled Text
      </Typography>
    );

    const textElement = screen.getByText("Styled Text");
    expect(textElement).toHaveStyle("text-align: center");
    expect(textElement).toHaveStyle("text-decoration: underline");
  });

  test("applies correct font weight", () => {
    render(
      <Typography size="body" weight="bold">
        Bold Text
      </Typography>
    );

    const textElement = screen.getByText("Bold Text");
    expect(textElement).toHaveStyle("font-weight: bold");
  });

  test("applies custom class name", () => {
    render(
      <Typography size="body" className="custom-class">
        Classy Text
      </Typography>
    );

    const textElement = screen.getByText("Classy Text");
    expect(textElement).toHaveClass("custom-class");
  });
});
