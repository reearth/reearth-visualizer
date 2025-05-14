import {
  render,
  screen,
  fireEvent,
  renderHook,
  act
} from "@reearth/test/utils";
import { describe, it, expect, vi } from "vitest";

import useTimePeriodField from "./hooks";

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

describe("useTimePeriodField", () => {
  const defaultProps = {
    timePeriodValues: {
      startTime: "2025-04-14T00:00:00Z",
      currentTime: "2025-04-14T12:00:00Z",
      endTime: "2025-04-15T00:00:00Z"
    },
    onChange: vi.fn(),
    onClose: vi.fn()
  };

  it("initializes with default values", () => {
    const { result } = renderHook(() => useTimePeriodField(defaultProps));

    expect(result.current.localValue).toEqual(defaultProps.timePeriodValues);
    expect(result.current.timeRangeInvalid).toBe(false);
    expect(result.current.submitDisabled).toBe(false);
  });

  it("handles value changes correctly", () => {
    const { result } = renderHook(() => useTimePeriodField(defaultProps));

    act(() => {
      result.current.handleChange("2025-04-14T06:00:00Z", "startTime");
    });

    expect(result.current.localValue?.startTime).toBe("2025-04-14T06:00:00Z");
  });

  it("disables submit when time range is invalid", () => {
    const { result } = renderHook(() => useTimePeriodField(defaultProps));

    act(() => {
      result.current.handleChange("2025-04-16T00:00:00Z", "currentTime");
    });

    expect(result.current.timeRangeInvalid).toBe(true);
    expect(result.current.submitDisabled).toBe(true);
  });

  it("calls onChange and onClose on submit", () => {
    const { result } = renderHook(() => useTimePeriodField(defaultProps));

    act(() => {
      result.current.handleSubmit();
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      defaultProps.timePeriodValues
    );
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
