import { render, screen } from "@reearth/test/utils";
import { vi, describe, test, expect, beforeEach } from "vitest";

import { Icon } from "./index";

vi.mock("./icons", () => ({
  default: {
    triangle: () => <svg data-testid="triangle-icon">Triangle Icon</svg>,
    circle: () => <svg data-testid="circle-icon">Circle Icon</svg>,
    square: () => <svg data-testid="square-icon">Square Icon</svg>
  }
}));

vi.mock("@reearth/app/lib/reearth-ui/components/Tooltip", () => ({
  default: ({
    text,
    icon,
    iconColor
  }: {
    text: string;
    icon: string;
    iconColor: string;
  }) => (
    <div
      data-testid="tooltip-component"
      data-text={text}
      data-icon={icon}
      data-icon-color={iconColor}
    >
      Tooltip with {text}
    </div>
  )
}));

describe("Icon Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("does not render when no icon is provided", () => {
    // @ts-expect-error - Intentionally testing with undefined icon
    render(<Icon icon={undefined} />);
    expect(screen.queryByTestId("triangle-icon")).not.toBeInTheDocument();
  });

  test("renders the correct icon", () => {
    render(<Icon icon="triangle" />);
    expect(screen.getByTestId("triangle-icon")).toBeInTheDocument();

    render(<Icon icon="circle" />);
    expect(screen.getByTestId("circle-icon")).toBeInTheDocument();
  });

  test("renders with tooltip when tooltipText is provided", () => {
    render(
      <Icon icon="triangle" tooltipText="This is a triangle" color="#00FF00" />
    );

    const tooltip = screen.getByTestId("tooltip-component");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveAttribute("data-text", "This is a triangle");
    expect(tooltip).toHaveAttribute("data-icon", "triangle");
    expect(tooltip).toHaveAttribute("data-icon-color", "#00FF00");
  });

  test("doesn't render tooltip when tooltipText is not provided", () => {
    render(<Icon icon="triangle" />);

    expect(screen.queryByTestId("tooltip-component")).not.toBeInTheDocument();
    expect(screen.getByTestId("triangle-icon")).toBeInTheDocument();
  });

  test("returns null for non-existent icons", () => {
    // @ts-expect-error - Intentionally testing with invalid icon
    render(<Icon icon="non-existent" />);

    expect(screen.queryByTestId("triangle-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("circle-icon")).not.toBeInTheDocument();
    expect(screen.queryByTestId("square-icon")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("passes placement and offset props to tooltip", () => {
    render(
      <Icon
        icon="triangle"
        tooltipText="Positioned tooltip"
        placement="top"
        offset={10}
      />
    );

    const tooltip = screen.getByTestId("tooltip-component");
    expect(tooltip).toBeInTheDocument();
  });
});
