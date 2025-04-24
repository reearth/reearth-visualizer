import { screen, render } from "@reearth/test/utils";
import { describe, test, expect } from "vitest";

import { Slide } from "./index";

describe("Slide Component", () => {
  test("renders children correctly", () => {
    render(
      <Slide>
        <div key="slide1">Slide 1</div>
        <div key="slide2">Slide 2</div>
      </Slide>
    );

    expect(screen.getByText("Slide 1")).toBeInTheDocument();
    expect(screen.getByText("Slide 2")).toBeInTheDocument();
  });

  test("applies transform based on pos prop", () => {
    const { rerender } = render(
      <Slide pos={0}>
        <div key="slide1">Slide 1</div>
        <div key="slide2">Slide 2</div>
      </Slide>
    );

    let inner = screen.getByTestId("slide-inner");
    expect(inner).toHaveStyle({ transform: "translateX(-0%)" });

    rerender(
      <Slide pos={1}>
        <div key="slide1">Slide 1</div>
        <div key="slide2">Slide 2</div>
      </Slide>
    );

    inner = screen.getByTestId("slide-inner");
    expect(inner).toHaveStyle({ transform: "translateX(-100%)" });
  });
});
