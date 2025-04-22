import { render, screen } from "@reearth/test/utils";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CheckBoxField, { CheckBoxFieldProps } from ".";

describe("CheckBoxField", () => {
  const defaultProps: CheckBoxFieldProps = {
    title: "Test Title",
    description: "Test Description",
    onChange: vi.fn()
  };

  it("renders the title and description", () => {
    render(<CheckBoxField {...defaultProps} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("calls onChange when clicked", async () => {
    const user = userEvent.setup();
    render(<CheckBoxField {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(defaultProps.onChange).toHaveBeenCalled();
  });
});
