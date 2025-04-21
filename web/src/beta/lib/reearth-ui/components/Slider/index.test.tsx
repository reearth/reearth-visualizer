import { screen, render } from "@reearth/test/utils";
import { describe, test, expect } from "vitest";

import { Slider } from "./index";

describe("Slider Component", () => {
  test("renders with default props", () => {
    render(<Slider value={50} />);

    const sliderElement = screen.getByRole("slider");
    expect(sliderElement).toBeInTheDocument();
    expect(sliderElement).toHaveAttribute("aria-valuenow", "50");
  });

  test("renders with custom min, max values", () => {
    render(<Slider value={5} min={0} max={10} />);

    const sliderElement = screen.getByRole("slider");
    expect(sliderElement).toHaveAttribute("aria-valuenow", "5");
    expect(sliderElement).toHaveAttribute("aria-valuemin", "0");
    expect(sliderElement).toHaveAttribute("aria-valuemax", "10");
  });

  test("renders in disabled state", () => {
    render(<Slider value={50} disabled />);

    const sliderElement = screen.getByRole("slider");
    expect(sliderElement).toHaveAttribute("aria-disabled", "false");
  });

  test("updates when value prop changes", () => {
    const { rerender } = render(<Slider value={50} />);

    let sliderElement = screen.getByRole("slider");
    expect(sliderElement).toHaveAttribute("aria-valuenow", "50");

    rerender(<Slider value={75} />);

    sliderElement = screen.getByRole("slider");
    expect(sliderElement).toHaveAttribute("aria-valuenow", "75");
  });
});
