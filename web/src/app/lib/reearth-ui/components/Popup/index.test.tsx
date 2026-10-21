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

  test("keeps a focused parent popup accessible when a child popup opens", () => {
    render(
      <Popup trigger={<button>Settings</button>}>
        <Popup trigger={<button>Language</button>}>
          <button>English</button>
        </Popup>
      </Popup>
    );

    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    const language = screen.getByRole("button", { name: "Language" });
    language.focus();
    fireEvent.click(language);

    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
    expect(language).toHaveFocus();
    expect(language.closest('[role="menu"]')).not.toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  test("keeps a focused button accessible while its tooltip is open", () => {
    render(
      <Popup trigger={<button>Layers</button>}>
        <Popup
          trigger={<button>Hide layer</button>}
          triggerOnHover
          tooltip
          open
        >
          Hide layer
        </Popup>
      </Popup>
    );

    fireEvent.click(screen.getByRole("button", { name: "Layers" }));
    const eye = screen.getByRole("button", { name: "Hide layer" });
    eye.focus();

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(eye).toHaveFocus();
    expect(eye.closest('[role="menu"]')).not.toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });
});
