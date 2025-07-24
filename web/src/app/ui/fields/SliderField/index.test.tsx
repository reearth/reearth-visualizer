import { render } from "@reearth/test/utils";
import { describe, expect, it, vi } from "vitest";

import SliderField, { SliderFieldProps } from "./index";

describe("SliderField", () => {
  const defaultProps: SliderFieldProps = {
    title: "Test Slider",
    description: "This is a test slider",
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    onChange: vi.fn()
  };

  it("should render correctly with title and description", () => {
    const { getByText } = render(<SliderField {...defaultProps} />);

    expect(getByText("Test Slider")).toBeInTheDocument();
    expect(getByText("This is a test slider")).toBeInTheDocument();
  });

  it("should render the slider with correct props", () => {
    const { getByRole } = render(<SliderField {...defaultProps} />);
    const slider = getByRole("slider") as HTMLInputElement;

    expect(slider.ariaValueNow).toBe("50");
    expect(slider.ariaValueMin).toBe("0");
    expect(slider.ariaValueMax).toBe("100");
  });
});
