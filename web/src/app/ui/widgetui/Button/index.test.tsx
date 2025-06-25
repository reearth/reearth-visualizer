import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import Button from "./index";

describe("Button Component", () => {
  test("renders with text", () => {
    render(<Button text="Click me" />);

    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  test("renders with children", () => {
    render(
      <Button>
        <span>Child content</span>
      </Button>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  test("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button text="Click me" onClick={handleClick} />);

    const button = screen.getByText("Click me").closest("button");
    fireEvent.click(button as HTMLElement);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("doesn't trigger click when disabled", () => {
    const handleClick = vi.fn();
    render(<Button text="Click me" disabled onClick={handleClick} />);

    const button = screen.getByText("Click me").closest("button");
    fireEvent.click(button as HTMLElement);

    expect(handleClick).not.toHaveBeenCalled();
  });

  test("renders with primary button type", () => {
    render(<Button text="Primary" buttonType="primary" />);

    const button = screen.getByText("Primary").closest("button");
    expect(button).toHaveStyle("border-color: rgb(15, 98, 254)");
  });

  test("renders with secondary button type", () => {
    render(<Button text="Secondary" />);
    const button = screen.getByText("Secondary").closest("button");
    expect(button).toHaveStyle({ color: "rgb(105, 112, 119)" });
  });

  test("renders with danger button type", () => {
    render(<Button text="Danger" buttonType="danger" />);
    const button = screen.getByText("Danger").closest("button");
    expect(button).toHaveStyle("border-color: rgb(218, 30, 40);");
  });

  test("renders with different sizes", () => {
    const { rerender } = render(<Button text="Medium" size="medium" />);

    let button = screen.getByText("Medium").closest("button");
    expect(button).toHaveStyle("border-radius: 6px");

    rerender(<Button text="Small" size="small" />);
    button = screen.getByText("Small").closest("button");
    expect(button).toHaveStyle("border-radius: 4px");
  });

  test("renders with left icon", () => {
    render(<Button text="With Icon" icon="home" iconPosition="left" />);

    const iconWrapper = screen.getByText("With Icon").previousSibling;
    expect(iconWrapper).toBeInTheDocument();
  });

  test("renders with right icon", () => {
    render(<Button text="With Icon" icon="home" iconPosition="right" />);

    const iconWrapper = screen.getByText("With Icon").nextSibling;
    expect(iconWrapper).toBeInTheDocument();
  });

  test("applies custom margin", () => {
    render(<Button text="With Margin" margin="10px" />);

    const button = screen.getByText("With Margin").closest("button");
    expect(button).toHaveStyle("margin: 10px");
  });

  test("handles mouse enter and leave events", () => {
    const handleMouseEnter = vi.fn();
    const handleMouseLeave = vi.fn();

    render(
      <Button
        text="Hover Button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );

    const button = screen.getByText("Hover Button").closest("button");

    fireEvent.mouseEnter(button as HTMLElement);
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(button as HTMLElement);
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
  });
});
