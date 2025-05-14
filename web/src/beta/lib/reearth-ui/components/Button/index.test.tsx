import { fireEvent, render, screen } from "@reearth/test/utils";
import { expect, describe, it, vi } from "vitest";

import { Button } from ".";

describe("Button Component", () => {
  it("renders button with title", () => {
    render(<Button title="Test Button" />);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Test Button");
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button title="Click Me" onClick={handleClick} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(<Button title="Disabled" onClick={handleClick} disabled />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders tileComponent if provided", () => {
    render(
      <Button
        title="Button"
        tileComponent={<span data-testid="tile">Tile Component</span>}
      />
    );
    const tile = screen.getByTestId("tile");
    expect(tile).toBeInTheDocument();
    expect(tile).toHaveTextContent("Tile Component");
  });

  it("calls onMouseEnter and onMouseLeave when events occur", () => {
    const handleMouseEnter = vi.fn();
    const handleMouseLeave = vi.fn();
    render(
      <Button
        title="Hover Button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);
    expect(handleMouseEnter).toHaveBeenCalled();
    fireEvent.mouseLeave(button);
    expect(handleMouseLeave).toHaveBeenCalled();
  });

  it("does not render title when iconButton is true", () => {
    render(<Button title="Should Not Appear" iconButton icon="data" />);
    const button = screen.getByRole("button");
    expect(button).not.toHaveTextContent("Should Not Appear");
  });
});
