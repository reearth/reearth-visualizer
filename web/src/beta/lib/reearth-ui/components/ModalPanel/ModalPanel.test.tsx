import { render, screen, fireEvent } from "@reearth/test/utils";
import React from "react";
import { vi, describe, test, expect, beforeEach } from "vitest";

import { ModalPanel } from "./index";

vi.mock("@reearth/beta/lib/reearth-ui", () => ({
  Button: ({
    onClick,
    icon,
    size,
    appearance,
    iconButton
  }: {
    onClick?: () => void;
    icon?: string;
    size?: string;
    appearance?: string;
    iconButton?: boolean;
  }) => (
    <button
      data-testid="mock-button"
      data-icon={icon}
      data-size={size}
      data-appearance={appearance}
      data-icon-button={iconButton ? "true" : "false"}
      onClick={onClick}
    >
      {icon}
    </button>
  )
}));

describe("ModalPanel Component", () => {
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders with title and content", () => {
    render(
      <ModalPanel title="Test Title">
        <div data-testid="panel-content">Panel Content</div>
      </ModalPanel>
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();

    expect(screen.getByTestId("panel-content")).toBeInTheDocument();
    expect(screen.getByTestId("panel-content")).toHaveTextContent(
      "Panel Content"
    );

    const closeButton = screen.getByTestId("mock-button");
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute("data-icon", "close");
  });

  test("calls onCancel when close button is clicked", () => {
    render(
      <ModalPanel title="Test Title" onCancel={mockOnCancel}>
        <div>Panel Content</div>
      </ModalPanel>
    );

    const closeButton = screen.getByTestId("mock-button");
    fireEvent.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test("doesn't show header in simple appearance mode", () => {
    render(
      <ModalPanel title="Test Title" appearance="simple">
        <div data-testid="panel-content">Simple Panel</div>
      </ModalPanel>
    );

    expect(screen.queryByText("Test Title")).not.toBeInTheDocument();

    expect(screen.queryByTestId("mock-button")).not.toBeInTheDocument();

    expect(screen.getByTestId("panel-content")).toBeInTheDocument();
  });

  test("renders actions when provided", () => {
    render(
      <ModalPanel
        title="Test Title"
        actions={<button data-testid="action-button">Action</button>}
      >
        <div>Panel Content</div>
      </ModalPanel>
    );

    expect(screen.getByTestId("action-button")).toBeInTheDocument();
  });

  test("renders with default props", () => {
    render(
      <ModalPanel>
        <div data-testid="panel-content">Default Props</div>
      </ModalPanel>
    );

    expect(screen.getByTestId("panel-content")).toBeInTheDocument();

    expect(screen.getByTestId("mock-button")).toBeInTheDocument();

    const content = screen.getByTestId("panel-content");
    const actionWrapper = content.parentElement?.nextElementSibling;
    expect(actionWrapper).toBeNull();
  });
});
