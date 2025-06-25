import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect } from "vitest";

import { Panel } from "./index";

describe("Panel Component", () => {
  test("renders children without title", () => {
    render(<Panel>Panel content</Panel>);

    expect(screen.getByText("Panel content")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument(); // No collapse button
  });

  test("renders with title and panel content", () => {
    render(<Panel title="Panel Title">Panel content</Panel>);

    expect(screen.getByText("Panel Title")).toBeInTheDocument();
    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  test("starts collapsed when collapsed prop is true", () => {
    render(
      <Panel title="Panel Title" collapsed>
        Panel content
      </Panel>
    );

    expect(screen.getByText("Panel Title")).toBeInTheDocument();
    expect(screen.queryByText("Panel content")).not.toBeInTheDocument();
  });

  test("cannot be collapsed when alwaysOpen is true", () => {
    render(
      <Panel title="Panel Title" alwaysOpen>
        Panel content
      </Panel>
    );

    expect(screen.getByText("Panel Title")).toBeInTheDocument();
    expect(screen.getByText("Panel content")).toBeInTheDocument();

    // The header should not be clickable when alwaysOpen is true
    const header = screen.getByText("Panel Title");
    fireEvent.click(header);

    expect(screen.getByText("Panel content")).toBeInTheDocument();
  });

  test("shows collapse area button when showCollapseArea is true", () => {
    render(
      <Panel title="Panel Title" showCollapseArea>
        Panel content
      </Panel>
    );

    const collapseAreaButton = document.querySelector("svg");
    expect(collapseAreaButton).toBeInTheDocument();
  });

  test("applies default background", () => {
    const { container } = render(<Panel>Panel content</Panel>);

    const contentWrapper = container.firstChild?.firstChild;
    expect(contentWrapper).toHaveStyle("background: rgb(22, 22, 22);");
  });

  test("applies normal background", () => {
    const { container } = render(
      <Panel background="normal">Panel content</Panel>
    );

    const contentWrapper = container.firstChild?.firstChild;
    expect(contentWrapper).toHaveStyle("background: rgb(38, 38, 38);");
  });

  test("applies custom background color", () => {
    const { container } = render(
      <Panel background="#ff0000">Panel content</Panel>
    );

    const contentWrapper = container.firstChild?.firstChild;
    expect(contentWrapper).toHaveStyle("background: #ff0000");
  });

  test("extends to fill container when extend is true", () => {
    const { container } = render(<Panel extend>Panel content</Panel>);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle("flex: 1");
  });
});
