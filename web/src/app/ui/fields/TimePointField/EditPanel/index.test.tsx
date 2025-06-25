import { render, screen, fireEvent } from "@reearth/test/utils";
import { describe, it, expect, vi } from "vitest";

import EditPanel from "./index";

describe("EditPanel", () => {
  const defaultProps = {
    value: "2025-04-14T12:00:00Z",
    onChange: vi.fn(),
    onClose: vi.fn()
  };

  it("renders correctly with initial values", () => {
    render(<EditPanel {...defaultProps} />);

    expect(screen.getByText("Set Time")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Time Zone")).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<EditPanel {...defaultProps} />);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onChange when apply button is clicked", () => {
    render(<EditPanel {...defaultProps} />);

    const applyButton = screen.getByText("Apply");
    fireEvent.click(applyButton);

    expect(defaultProps.onChange).toHaveBeenCalled();
  });
});
