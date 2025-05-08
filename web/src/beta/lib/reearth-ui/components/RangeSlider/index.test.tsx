import { render } from "@reearth/test/utils";
import { describe, test, expect } from "vitest";

import { RangeSlider } from "./index";

describe("RangeSlider Component", () => {
  test("renders with default props", () => {
    render(<RangeSlider value={[20, 80]} />);

    const sliderElement = document.querySelector(".rc-slider");
    expect(sliderElement).toBeInTheDocument();
  });

  test("updates when value prop changes", () => {
    const { rerender } = render(<RangeSlider value={[20, 80]} />);

    rerender(<RangeSlider value={[30, 70]} />);

    const sliderElement = document.querySelector(".rc-slider");
    expect(sliderElement).toBeInTheDocument();
    const handles = document.querySelectorAll(".rc-slider-handle");
    const firstHandle = handles[0] as HTMLElement;
    const secondHandle = handles[1] as HTMLElement;
    expect(firstHandle.style.left).toBe("30%");
    expect(secondHandle.style.left).toBe("70%");
  });

  test("renders in disabled state", () => {
    render(<RangeSlider value={[20, 80]} disabled />);

    const disabledSlider = document.querySelector(".rc-slider-disabled");
    expect(disabledSlider).toBeInTheDocument();
  });

  test("uses calculated step when not explicitly provided", () => {
    render(<RangeSlider value={[20, 80]} min={0} max={100} />);

    const sliderElement = document.querySelector(".rc-slider");
    expect(sliderElement).toBeInTheDocument();

    const slider = sliderElement as HTMLElement;
    expect(slider.getAttribute("step") || "1").toBe("1");
  });
});
