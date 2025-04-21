import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { Selector } from "./index";

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("Selector Component", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" }
  ];

  test("renders with placeholder when no value selected", () => {
    render(<Selector options={options} />);

    expect(screen.getByText("Please select")).toBeInTheDocument();
  });

  test("renders with selected value", () => {
    render(<Selector options={options} value="option2" />);

    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  test("opens dropdown when clicked", () => {
    render(<Selector options={options} />);

    const selectInput = screen.getByTestId("select-input");
    fireEvent.click(selectInput);

    expect(
      screen.getByRole("option", { name: "Option 1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Option 2" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Option 3" })
    ).toBeInTheDocument();
  });

  test("selects an option when clicked", () => {
    const handleChange = vi.fn();
    render(<Selector options={options} onChange={handleChange} />);

    const selectInput = screen.getByTestId("select-input");
    fireEvent.click(selectInput);

    const option = screen.getByRole("option", { name: "Option 2" });
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith("option2");
  });

  test("selects multiple options in multiple mode", () => {
    const handleChange = vi.fn();
    render(<Selector options={options} multiple onChange={handleChange} />);

    const selectInput = screen.getByTestId("select-input");
    fireEvent.click(selectInput);

    const option1 = screen.getByRole("option", { name: "Option 1" });
    fireEvent.click(option1);

    expect(handleChange).toHaveBeenCalledWith(["option1"]);

    const option3 = screen.getByRole("option", { name: "Option 3" });
    fireEvent.click(option3);

    expect(handleChange).toHaveBeenCalledWith(["option1", "option3"]);
  });

  test("removes an option when unselected in multiple mode", () => {
    const handleChange = vi.fn();
    render(
      <Selector
        options={options}
        multiple
        value={["option1", "option2"]}
        onChange={handleChange}
      />
    );

    const closeButtons = screen.getAllByRole("button");
    fireEvent.click(closeButtons[0]);

    expect(handleChange).toHaveBeenCalledWith(["option2"]);
  });

  test("renders in disabled state", () => {
    const handleChange = vi.fn();

    render(
      <Selector
        options={options}
        disabled
        value="option1"
        onChange={handleChange}
      />
    );

    const selectInput = screen.getByTestId("select-input");
    fireEvent.click(selectInput);

    expect(handleChange).not.toHaveBeenCalled();
  });

  test("displays custom label with displayLabel prop", () => {
    render(<Selector options={options} displayLabel="Custom Display Text" />);

    expect(screen.getByText("Custom Display Text")).toBeInTheDocument();
  });

  test("shows 'No Options yet' message when options array is empty", () => {
    render(<Selector options={[]} />);

    const selectInput = screen.getByTestId("select-input");
    fireEvent.click(selectInput);

    expect(screen.getByText("No Options yet")).toBeInTheDocument();
  });
});
