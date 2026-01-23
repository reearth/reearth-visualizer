import { render, screen, fireEvent } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { Panel } from "./index";

describe("Panel Component", () => {
  test("renders with default props", () => {
    render(<Panel>Test Content</Panel>);

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("renders with custom title", () => {
    render(<Panel title="Custom Title">Test Content</Panel>);

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("renders with custom width", () => {
    const customWidth = 400;
    const { container } = render(
      <Panel width={customWidth}>Test Content</Panel>
    );

    expect(container.firstChild).toHaveStyle(`width: ${customWidth}px`);
  });

  test("renders with actions", () => {
    render(
      <Panel actions={<button>Action Button</button>}>Test Content</Panel>
    );

    expect(screen.getByText("Action Button")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("calls onCancel when close button is clicked", () => {
    const handleCancel = vi.fn();
    render(
      <Panel title="Test Title" onCancel={handleCancel}>
        Test Content
      </Panel>
    );

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  test("does not render header when title is not provided", () => {
    render(<Panel>Test Content</Panel>);

    const closeButton = screen.queryByRole("button");
    expect(closeButton).not.toBeInTheDocument();
  });

  test("does not render actions section when actions are not provided", () => {
    const { container } = render(<Panel>Test Content</Panel>);

    const actionWrappers = container.querySelectorAll(
      "[class*='ActionWrapper']"
    );
    expect(actionWrappers.length).toBe(0);
  });
});
