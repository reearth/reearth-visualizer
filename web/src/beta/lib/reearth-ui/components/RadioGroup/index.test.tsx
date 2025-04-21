import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { RadioGroup } from "./index";

describe("RadioGroup Component", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" }
  ];

  test("renders all provided options", () => {
    render(<RadioGroup options={options} />);

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  test("selects the option matching the value prop", () => {
    render(<RadioGroup options={options} value="option2" />);

    const radioInputs = screen.getAllByRole("radio");
    expect(radioInputs[0]).not.toBeChecked();
    expect(radioInputs[1]).toBeChecked();
    expect(radioInputs[2]).not.toBeChecked();
  });

  test("calls onChange when a radio is selected", () => {
    const handleChange = vi.fn();
    render(<RadioGroup options={options} onChange={handleChange} />);

    fireEvent.click(screen.getByText("Option 2"));

    expect(handleChange).toHaveBeenCalledWith("option2");
  });

  test("updates selected option when the value prop changes", () => {
    const { rerender } = render(
      <RadioGroup options={options} value="option1" />
    );

    let radioInputs = screen.getAllByRole("radio");
    expect(radioInputs[0]).toBeChecked();

    rerender(<RadioGroup options={options} value="option3" />);

    radioInputs = screen.getAllByRole("radio");
    expect(radioInputs[2]).toBeChecked();
  });

  test("renders with vertical layout when specified", () => {
    const { container } = render(
      <RadioGroup options={options} layout="vertical" />
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle("flex-direction: column");
  });

  test("renders with horizontal layout by default", () => {
    const { container } = render(<RadioGroup options={options} />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle("flex-direction: row");
  });
});
