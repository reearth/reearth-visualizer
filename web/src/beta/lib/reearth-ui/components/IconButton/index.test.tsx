import { render, screen, fireEvent } from "@reearth/test/utils";
import { vi, describe, test, expect, beforeEach } from "vitest";

import { IconButton } from "./index";

vi.mock("../Icon", () => ({
  Icon: ({ icon, color }: { icon: string; color?: string }) => (
    <div data-testid="mock-icon" data-icon={icon} data-color={color}>
      {icon}
    </div>
  )
}));

vi.mock("../Tooltip", () => ({
  default: ({
    text,
    placement,
    offset,
    triggerComponent
  }: {
    text: string;
    placement: string;
    offset?: number;
    triggerComponent: JSX.Element;
  }) => (
    <div
      data-testid="mock-tooltip"
      data-text={text}
      data-placement={placement}
      data-offset={offset}
    >
      {triggerComponent}
    </div>
  )
}));

describe("IconButton Component", () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders with default props", () => {
    render(<IconButton icon="triangle" />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("data-icon", "triangle");
  });

  test("calls onClick handler when clicked", () => {
    render(<IconButton icon="triangle" onClick={mockOnClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test("doesn't call onClick when disabled", () => {
    render(<IconButton icon="triangle" onClick={mockOnClick} disabled />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test("renders with tooltip when tooltipText is provided", () => {
    render(
      <IconButton
        icon="triangle"
        tooltipText="This is a tooltip"
        placement="top"
      />
    );

    const tooltip = screen.getByTestId("mock-tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute("data-text", "This is a tooltip");
    expect(tooltip).toHaveAttribute("data-placement", "top");
    expect(tooltip).toHaveAttribute("data-offset", "5");

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  test("applies custom icon color", () => {
    render(<IconButton icon="triangle" iconColor="#FF0000" />);

    const icon = screen.getByTestId("mock-icon");
    expect(icon).toHaveAttribute("data-color", "#FF0000");
  });

  test("renders different button sizes", () => {
    const { rerender } = render(
      <IconButton icon="triangle" size="small" data-testid="button" />
    );

    let button = screen.getByRole("button");
    expect(button).toHaveStyle({ width: "20px" });

    rerender(<IconButton icon="triangle" size="large" data-testid="button" />);

    button = screen.getByRole("button");
    expect(button).toHaveStyle({ width: "36px" });
  });

  test("renders different appearances", () => {
    const { rerender } = render(
      <IconButton icon="triangle" appearance="primary" data-testid="button" />
    );

    let button = screen.getByRole("button");
    expect(button).toHaveStyle({ color: "rgb(15, 98, 254)" });

    rerender(
      <IconButton icon="triangle" appearance="dangerous" data-testid="button" />
    );

    button = screen.getByRole("button");
    expect(button).toHaveStyle({ color: "rgb(218, 30, 40)" });
  });

  test("applies active state", () => {
    render(<IconButton icon="triangle" active data-testid="button" />);

    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ color: "#ffffff" });
    expect(button).toHaveStyle({ "background-color": "rgb(0, 67, 206)" });
  });

  test("applies border when hasBorder is true", () => {
    render(<IconButton icon="triangle" hasBorder data-testid="button" />);

    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ border: "1px solid rgb(77, 83, 88)" });
  });
});
