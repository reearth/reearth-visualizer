import { screen, fireEvent, render } from "@reearth/test/utils";
import { describe, test, expect, vi } from "vitest";

import { Switcher } from "./index";

describe("Switcher Component", () => {
  test("renders in off state by default", () => {
    render(<Switcher />);

    const switcherCircle = screen.getByTestId("switcher").firstChild;
    expect(switcherCircle).toHaveStyle("transform: translateX(0)");
  });

  test("renders in on state when value is true", () => {
    render(<Switcher value={true} />);

    const switcherCircle = screen.getByTestId("switcher").firstChild;
    expect(switcherCircle).toHaveStyle("transform: translateX(10px)");
  });

  test("toggles state when clicked", () => {
    render(<Switcher />);

    const switcher = screen.getByTestId("switcher");
    const switcherCircle = switcher.firstChild;

    expect(switcherCircle).toHaveStyle("transform: translateX(0)");

    fireEvent.click(switcher);

    expect(switcherCircle).toHaveStyle("transform: translateX(10px)");
  });

  test("calls onChange with new value when clicked", () => {
    const handleChange = vi.fn();
    render(<Switcher value={false} onChange={handleChange} />);

    const switcher = screen.getByTestId("switcher");
    fireEvent.click(switcher);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  test("does not toggle when disabled", () => {
    const handleChange = vi.fn();
    render(<Switcher disabled onChange={handleChange} />);

    const switcher = screen.getByTestId("switcher");
    const switcherCircle = switcher.firstChild;

    expect(switcherCircle).toHaveStyle("transform: translateX(0)");

    fireEvent.click(switcher);

    expect(switcherCircle).toHaveStyle("transform: translateX(0)");
    expect(handleChange).not.toHaveBeenCalled();
  });

  test("updates when value prop changes", () => {
    const { rerender } = render(<Switcher value={false} />);

    const switcherCircle = screen.getByTestId("switcher").firstChild;
    expect(switcherCircle).toHaveStyle("transform: translateX(0)");

    rerender(<Switcher value={true} />);

    expect(switcherCircle).toHaveStyle("transform: translateX(10px)");
  });
});
