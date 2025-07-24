import { ThemeProvider } from "@emotion/react";
import darkTheme from "@reearth/services/theme/reearthTheme/darkTheme";
import { render, act } from "@reearth/test/utils";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import SelectorField, { SelectorFieldProps } from "./index";

describe("SelectField", () => {
  const defaultProps: SelectorFieldProps = {
    title: "Test Title",
    description: "Test Description",
    options: [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" }
    ],
    value: "1",
    onChange: vi.fn()
  };

  it("should render with title and description", () => {
    const { getByText } = render(<SelectorField {...defaultProps} />);

    expect(getByText("Test Title")).toBeInTheDocument();
    expect(getByText("Test Description")).toBeInTheDocument();
  });

  it("should render options in the selector", async () => {
    const { getByTestId, findAllByRole } = render(
      <ThemeProvider theme={darkTheme}>
        <SelectorField {...defaultProps} />
      </ThemeProvider>
    );

    const dropdownTrigger = getByTestId("select-input");
    act(() => {
      dropdownTrigger.click();
    });

    const options = await findAllByRole("option");

    expect(options).toHaveLength(2);
  });

  it("should call onChange when an option is selected", async () => {
    const onChangeMock = vi.fn();
    const { getByTestId, findByRole } = render(
      <ThemeProvider theme={darkTheme}>
        <SelectorField {...defaultProps} onChange={onChangeMock} />
      </ThemeProvider>
    );

    const dropdownTrigger = getByTestId("select-input");
    act(() => {
      dropdownTrigger.click();
    });

    const option = await findByRole("option", { name: "Option 2" });
    act(() => {
      option.click();
    });

    expect(onChangeMock).toHaveBeenCalledWith("2");
  });
});
