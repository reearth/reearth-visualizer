import { screen, render } from "@reearth/test/utils";
import { describe, test, expect } from "vitest";

import { Area } from "./index";

describe("Area Component", () => {
  test("renders with default props", () => {
    render(<Area>Content</Area>);

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  test("renders with initial width and height", () => {
    const { container } = render(
      <Area initialWidth={400} initialHeight={300}>
        Content
      </Area>
    );

    const areaElement = container.firstChild;
    expect(areaElement).toHaveStyle("width: 100%");
    expect(areaElement).toHaveStyle("height: 300px");
  });

  test("renders with row direction", () => {
    const { container } = render(<Area direction="row">Content</Area>);

    const areaElement = container.firstChild;
    expect(areaElement).toHaveStyle("flex-direction: row");
  });

  test("renders with column direction", () => {
    const { container } = render(<Area direction="column">Content</Area>);

    const areaElement = container.firstChild;
    expect(areaElement).toHaveStyle("flex-direction: column");
  });

  test("renders resize handle with right edge", () => {
    render(
      <Area direction="column" resizableEdge="right">
        Content
      </Area>
    );

    const resizeHandle = screen.getByTestId("resize-handle");
    expect(resizeHandle).toBeInTheDocument();
    expect(resizeHandle).toHaveStyle("cursor: ew-resize");
  });

  test("renders resize handle with bottom edge", () => {
    render(
      <Area direction="row" resizableEdge="bottom">
        Content
      </Area>
    );

    const resizeHandle = screen.getByTestId("resize-handle");
    expect(resizeHandle).toBeInTheDocument();
    expect(resizeHandle).toHaveStyle("cursor: ns-resize");
  });

  test("doesn't render resize handle for invalid edge", () => {
    render(
      <Area direction="row" resizableEdge="right">
        Content
      </Area>
    );

    const resizeHandle = document.querySelector('[class*="ResizeHandle"]');
    expect(resizeHandle).not.toBeInTheDocument();
  });

  test("applies background color", () => {
    const { container } = render(
      <Area backgroundColor="#ff0000">Content</Area>
    );

    const areaElement = container.firstChild;
    expect(areaElement).toHaveStyle("background-color: #ff0000");
  });

  test("hides component when hidden is true", () => {
    const { container } = render(<Area hidden>Content</Area>);

    const areaElement = container.firstChild;
    expect(areaElement).toHaveStyle("display: none");
  });

  test("extends to fill container when extend is true", () => {
    const { container } = render(<Area extend>Content</Area>);

    const areaElement = container.firstChild;
    expect(areaElement).toHaveStyle("flex-grow: 1");
    expect(areaElement).toHaveStyle("flex-shrink: 1");
  });

  test("applies asWrapper style when asWrapper prop is true", () => {
    const { container } = render(
      <Area asWrapper>
        <div>Wrapper area</div>
      </Area>
    );

    const areaElement = container.firstChild;
    expect(areaElement).toHaveStyle("pointer-events: none");
    expect(areaElement).toHaveStyle("background-color: rgba(0, 0, 0, 0);");
    expect(areaElement).not.toHaveStyle("padding: 1px");
  });
});
