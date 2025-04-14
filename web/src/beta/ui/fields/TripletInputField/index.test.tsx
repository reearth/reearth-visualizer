import { fireEvent, render, screen } from "@reearth/test/utils";
import { describe, it, expect, vi } from "vitest";

import TripletInputField from "./index";

describe("TripletInputField", () => {
  it("should render with title and description", () => {
    render(
      <TripletInputField
        title="Test Title"
        description="Test Description"
        values={[1, 2, 3]}
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2")).toBeInTheDocument();
    expect(screen.getByDisplayValue("3")).toBeInTheDocument();
  });

  it("should call onChange when a value changes", () => {
    const handleChange = vi.fn();
    render(
      <TripletInputField
        title="Test Title"
        values={[1, 2, 3]}
        placeholders={["X", "Y", "Z"]}
        onChange={handleChange}
      />
    );

    const inputs = screen.getAllByPlaceholderText("X");
    fireEvent.change(inputs[0], { target: { value: "4" } });
    expect(handleChange).toHaveBeenCalledWith([4, 2, 3]);
  });

  it("should call onBlur when input loses focus", () => {
    const handleBlur = vi.fn();
    render(
      <TripletInputField
        title="Test Title"
        values={[1, 2, 3]}
        placeholders={["X", "Y", "Z"]}
        onBlur={handleBlur}
      />
    );

    const inputs = screen.getAllByPlaceholderText("X");
    fireEvent.blur(inputs[0]);
    expect(handleBlur).toHaveBeenCalledWith([1, 2, 3]);
  });

  it("should render with placeholders", () => {
    render(
      <TripletInputField
        title="Test Title"
        values={[1, 2, 3]}
        placeholders={["X", "Y", "Z"]}
        onChange={() => {}}
      />
    );

    expect(screen.getByPlaceholderText("X")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Y")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Z")).toBeInTheDocument();
  });
});
