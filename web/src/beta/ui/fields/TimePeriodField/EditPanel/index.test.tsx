import { render, screen, fireEvent } from "@reearth/test/utils";
import { describe, it, expect, vi } from "vitest";

import EditModal from "./index";

describe("EditModal", () => {
  const defaultProps = {
    visible: true,
    timePeriodValues: {
      startTime: "2025-04-14T00:00:00Z",
      currentTime: "2025-04-14T12:00:00Z",
      endTime: "2025-04-15T00:00:00Z"
    },
    onClose: vi.fn(),
    onChange: vi.fn()
  };

  it("renders correctly with initial values", () => {
    render(<EditModal {...defaultProps} />);

    expect(screen.getByText("* Start Time")).toBeInTheDocument();
    expect(screen.getByText("* Current Time")).toBeInTheDocument();
    expect(screen.getByText("* End Time")).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<EditModal {...defaultProps} />);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onChange when apply button is clicked", () => {
    render(<EditModal {...defaultProps} />);

    const applyButton = screen.getByText("Apply");
    fireEvent.click(applyButton);

    expect(defaultProps.onChange).toHaveBeenCalled();
  });
});
