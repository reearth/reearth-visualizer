import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { Popup } from "./index";

describe("Popup Component", () => {
  test("renders with trigger", () => {
    render(<Popup trigger="Click me">Popup content</Popup>);

    expect(screen.getByText("Click me")).toBeInTheDocument();
    expect(screen.queryByText("Popup content")).not.toBeInTheDocument();
  });

  test("shows content when trigger is clicked", () => {
    render(<Popup trigger="Click me">Popup content</Popup>);

    const trigger = screen.getByText("Click me");
    fireEvent.click(trigger);

    expect(screen.getByText("Popup content")).toBeInTheDocument();
  });

  test("hides content when clicking outside", () => {
    render(
      <div>
        <Popup trigger="Click me">Popup content</Popup>
        <div data-testid="outside">Outside</div>
      </div>
    );

    const trigger = screen.getByText("Click me");
    fireEvent.click(trigger);

    expect(screen.getByText("Popup content")).toBeInTheDocument();

    expect(screen.queryByText("outside")).not.toBeInTheDocument();
  });

  test("renders as controlled component", () => {
    const handleOpenChange = vi.fn();

    const { rerender } = render(
      <Popup trigger="Click me" open={false} onOpenChange={handleOpenChange}>
        Popup content
      </Popup>
    );

    expect(screen.queryByText("Popup content")).not.toBeInTheDocument();

    const trigger = screen.getByText("Click me");
    fireEvent.click(trigger);

    expect(handleOpenChange).toHaveBeenCalledWith(true);

    rerender(
      <Popup trigger="Click me" open={true} onOpenChange={handleOpenChange}>
        Popup content
      </Popup>
    );

    expect(screen.getByText("Popup content")).toBeInTheDocument();
  });

  test("auto closes when autoClose is enabled", () => {
    render(
      <Popup trigger="Click me" autoClose>
        <button>Action</button>
      </Popup>
    );

    const trigger = screen.getByText("Click me");
    fireEvent.click(trigger);

    expect(screen.getByText("Action")).toBeInTheDocument();

    const action = screen.getByText("Action");
    fireEvent.click(action);

    expect(screen.queryByText("Action")).not.toBeInTheDocument();
  });

  test("doesn't close when clicking content without autoClose", () => {
    render(
      <Popup trigger="Click me">
        <button>Action</button>
      </Popup>
    );

    const trigger = screen.getByText("Click me");
    fireEvent.click(trigger);

    const action = screen.getByText("Action");
    fireEvent.click(action);

    expect(screen.getByText("Action")).toBeInTheDocument();
  });
});
