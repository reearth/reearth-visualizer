import { render, screen, fireEvent } from "@reearth/test/utils";
import { vi, describe, test, expect, beforeEach } from "vitest";

import { Collapse } from "./index";

vi.mock("../Icon", () => ({
  Icon: ({ size, icon }: { size: string; icon: string }) => (
    <div data-testid={`icon-${icon}`}>{size}</div>
  )
}));

vi.mock("../Typography", () => ({
  Typography: ({
    children,
    size,
    weight
  }: {
    children: React.ReactNode;
    size: string;
    weight: string;
    otherProperties?: unknown;
  }) => (
    <span data-testid="typography" data-size={size} data-weight={weight}>
      {children}
    </span>
  )
}));

describe("Collapse Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test("renders with title and children", () => {
    render(
      <Collapse title="Test Title">
        <div data-testid="test-content">Test Content</div>
      </Collapse>
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  test("collapses and expands when clicked", () => {
    render(
      <Collapse title="Click Me">
        <div data-testid="test-content">Hidden Content</div>
      </Collapse>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Click Me"));

    expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Click Me"));

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  test("respects collapsed prop", () => {
    const { rerender } = render(
      <Collapse title="Test Title" collapsed={true}>
        <div data-testid="test-content">Hidden Content</div>
      </Collapse>
    );

    expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();

    rerender(
      <Collapse title="Test Title" collapsed={false}>
        <div data-testid="test-content">Visible Content</div>
      </Collapse>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });

  test("respects disabled prop", () => {
    render(
      <Collapse title="Disabled Collapse" disabled collapsed={true}>
        <div data-testid="test-content">This should stay hidden</div>
      </Collapse>
    );

    expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Disabled Collapse"));

    expect(screen.queryByTestId("test-content")).not.toBeInTheDocument();
  });

  test("calls onCollapse callback when toggling", () => {
    const mockOnCollapse = vi.fn();

    render(
      <Collapse title="Callback Test" onCollapse={mockOnCollapse}>
        <div>Test Content</div>
      </Collapse>
    );

    fireEvent.click(screen.getByText("Callback Test"));

    expect(mockOnCollapse).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByText("Callback Test"));

    expect(mockOnCollapse).toHaveBeenCalledWith(false);

    expect(mockOnCollapse).toHaveBeenCalledTimes(2);
  });

  test("renders with different sizes correctly", () => {
    const { rerender } = render(
      <Collapse title="Normal Size" size="normal">
        <div data-testid="content">Content</div>
      </Collapse>
    );

    rerender(
      <Collapse title="Small Size" size="small">
        <div data-testid="content">Content</div>
      </Collapse>
    );

    rerender(
      <Collapse title="Large Size" size="large">
        <div data-testid="content">Content</div>
      </Collapse>
    );

    expect(screen.getByText("Large Size")).toBeInTheDocument();
  });

  test("renders with titleSuffix and actions", () => {
    render(
      <Collapse
        title="With Extras"
        titleSuffix={<span data-testid="suffix">Suffix</span>}
        actions={<button data-testid="action-button">Action</button>}
      >
        <div>Content</div>
      </Collapse>
    );

    expect(screen.getByTestId("suffix")).toBeInTheDocument();
    expect(screen.getByTestId("action-button")).toBeInTheDocument();
  });

  test("renders with different icon positions", () => {
    const { rerender } = render(
      <Collapse title="Right Icon" iconPosition="right">
        <div>Content</div>
      </Collapse>
    );

    const icon = screen.getByTestId("icon-triangle");
    const title = screen.getByText("Right Icon");
    expect(title).toBeInTheDocument();
    expect(icon).toBeInTheDocument();

    rerender(
      <Collapse title="Left Icon" iconPosition="left">
        <div>Content</div>
      </Collapse>
    );

    const leftIcon = screen.getByTestId("icon-triangle");
    expect(leftIcon).toBeInTheDocument();

    expect(screen.getByText("Left Icon")).toBeInTheDocument();
  });
});
