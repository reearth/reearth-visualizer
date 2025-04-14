import { render, screen, fireEvent } from "@reearth/test/utils";
import { describe, expect, it, vi } from "vitest";

import TimePeriodField, { TimePeriodFieldProp } from "./index";

describe("TimePeriodField", () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    title: "Test Title",
    description: "Test Description",
    value: {
      currentTime: "2025-04-14T12:00:00Z",
      startTime: "2025-04-14T00:00:00Z",
      endTime: "2025-04-14T23:59:59Z"
    } as TimePeriodFieldProp,
    onChange: mockOnChange
  };

  it("renders the component with title and description", () => {
    render(<TimePeriodField {...defaultProps} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("displays the time period values when all fields are set", () => {
    render(<TimePeriodField {...defaultProps} />);

    expect(screen.getByText("2025-04-14T00:00:00Z")).toBeInTheDocument();
    expect(screen.getByText("2025-04-14T12:00:00Z")).toBeInTheDocument();
    expect(screen.getByText("2025-04-14T23:59:59Z")).toBeInTheDocument();
  });

  it("displays 'Not set' when time period values are missing", () => {
    render(<TimePeriodField {...defaultProps} value={undefined} />);

    expect(screen.getByText("Not set")).toBeInTheDocument();
  });

  it("calls onChange when the delete button is clicked", () => {
    render(<TimePeriodField {...defaultProps} />);

    const deleteButton = screen.getByTestId("delete-button");
    fireEvent.click(deleteButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("opens the edit modal when the set button is clicked", () => {
    render(<TimePeriodField {...defaultProps} />);

    const setButton = screen.getByTestId("set-button");
    fireEvent.click(setButton);

    expect(screen.getByText("Time Period Settings")).toBeInTheDocument();
  });
});
