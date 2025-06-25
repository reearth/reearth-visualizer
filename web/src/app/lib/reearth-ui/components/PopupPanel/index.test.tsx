import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { PopupPanel } from "./index";

describe("PopupPanel Component", () => {
  test("renders with default props", () => {
    render(<PopupPanel>Test Content</PopupPanel>);

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("renders with custom title", () => {
    render(<PopupPanel title="Custom Panel">Test Content</PopupPanel>);

    expect(screen.getByText("Custom Panel")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("renders with custom width", () => {
    const customWidth = 400;
    const { container } = render(
      <PopupPanel width={customWidth}>Test Content</PopupPanel>
    );

    const wrapperDiv = container.firstChild?.firstChild;
    expect(wrapperDiv).toHaveStyle(`width: ${customWidth}px`);
  });

  test("renders with actions", () => {
    render(
      <PopupPanel actions={<button>Action Button</button>}>
        Test Content
      </PopupPanel>
    );

    expect(screen.getByText("Action Button")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("calls onCancel when close button is clicked", () => {
    const handleCancel = vi.fn();
    render(
      <PopupPanel title="Test Panel" onCancel={handleCancel}>
        Test Content
      </PopupPanel>
    );

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  test("calls onCancel when clicking outside the panel", () => {
    const handleCancel = vi.fn();

    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <PopupPanel onCancel={handleCancel}>Test Content</PopupPanel>
      </div>
    );

    const outsideElement = screen.getByTestId("outside-element");
    fireEvent.mouseDown(outsideElement);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  test("does not render header when title is not provided", () => {
    render(<PopupPanel>Test Content</PopupPanel>);

    const closeButton = screen.queryByRole("button");
    expect(closeButton).not.toBeInTheDocument();
  });

  test("does not render actions section when actions are not provided", () => {
    const { container } = render(<PopupPanel>Test Content</PopupPanel>);

    const actionWrappers = container.querySelectorAll(
      "[class*='ActionWrapper']"
    );
    expect(actionWrappers.length).toBe(0);
  });
});
