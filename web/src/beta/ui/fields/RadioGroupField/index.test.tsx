import { ThemeProvider } from "@emotion/react";
import darkTheme from "@reearth/services/theme/reearthTheme/darkTheme";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import RadioGroupField from "./index";

describe("RadioGroupField", () => {
  it("should render options correctly", () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <RadioGroupField
          options={[
            { value: "1", label: "Option 1" },
            { value: "2", label: "Option 2" }
          ]}
        />
      </ThemeProvider>
    );

    const input1 = screen.getAllByRole("radio")[0];
    const input2 = screen.getAllByRole("radio")[1];
    expect(input1.getAttribute("type")).toBe("radio");
    expect(input2.getAttribute("type")).toBe("radio");
    expect(input1).toHaveAttribute("value", "1");
    expect(input2).toHaveAttribute("value", "2");
  });

  it("should call onChange when an option is selected", () => {
    const handleChange = vi.fn();
    render(
      <ThemeProvider theme={darkTheme}>
        <RadioGroupField
          options={[
            { value: "1", label: "Option 1" },
            { value: "2", label: "Option 2" }
          ]}
          onChange={handleChange}
        />
      </ThemeProvider>
    );

    const input1 = screen.getAllByRole("radio")[0];
    fireEvent.click(input1);

    expect(handleChange).toHaveBeenCalledWith("1");
  });
});
