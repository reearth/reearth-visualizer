import { ThemeProvider } from "@emotion/react";
import darkTheme from "@reearth/services/theme/reearthTheme/darkTheme";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import RangeField from "./index";

describe("RangeField", () => {
  it("should render with initial values", () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <RangeField
          title="Test Range"
          values={[10, 20]}
          placeholders={["Min", "Max"]}
        />
      </ThemeProvider>
    );

    expect(screen.getByPlaceholderText("Min")).toHaveValue("10");
    expect(screen.getByPlaceholderText("Max")).toHaveValue("20");
  });

  it("should call onChange when values are updated", () => {
    const handleChange = vi.fn();
    render(
      <ThemeProvider theme={darkTheme}>
        <RangeField
          title="Test Range"
          values={[10, 20]}
          onChange={handleChange}
          placeholders={["Min", "Max"]}
        />
      </ThemeProvider>
    );

    const minInput = screen.getByPlaceholderText("Min");
    fireEvent.change(minInput, { target: { value: "15" } });

    expect(handleChange).toHaveBeenCalledWith([15, 20]);

    const maxInput = screen.getByPlaceholderText("Max");
    fireEvent.change(maxInput, { target: { value: "25" } });

    expect(handleChange).toHaveBeenCalledWith([15, 25]);
  });

  it("should call onBlur when input loses focus", () => {
    const handleBlur = vi.fn();
    render(
      <ThemeProvider theme={darkTheme}>
        <RangeField
          title="Test Range"
          values={[10, 20]}
          onBlur={handleBlur}
          placeholders={["Min", "Max"]}
        />
      </ThemeProvider>
    );

    const minInput = screen.getByPlaceholderText("Min");
    fireEvent.blur(minInput);

    expect(handleBlur).toHaveBeenCalledWith([10, 20]);
  });
});
