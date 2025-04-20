import { ThemeProvider } from "@aws-amplify/ui-react";
import { render, screen, fireEvent } from "@reearth/test/utils";
import React from "react";
import { describe, it, expect, vi } from "vitest";

import CameraField, { CameraFieldProps } from "./index";

const mockOnSave = vi.fn();
const mockOnFlyTo = vi.fn();

describe("CameraField", () => {
  const defaultProps: CameraFieldProps = {
    title: "Test Camera Field",
    description: "Test Description",
    value: undefined,
    disabled: false,
    withFOV: false,
    onSave: mockOnSave,
    onFlyTo: mockOnFlyTo
  };

  it("renders correctly with default props", () => {
    render(<CameraField {...defaultProps} />);

    expect(screen.getByPlaceholderText("Not set")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Capture")).toBeInTheDocument();
  });

  it("opens EditPanel when Edit button is clicked", () => {
    render(
      <ThemeProvider theme={{ name: "dark" }}>
        <CameraField
          {...defaultProps}
          value={{
            lat: 35,
            lng: 139,
            height: 1000,
            heading: 0,
            pitch: 0,
            roll: 0,
            fov: 60
          }}
        />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByText("Camera Position Editor")).toBeInTheDocument();
  });

  it("calls onSave and closes popup when save is triggered from EditPanel", () => {
    render(
      <ThemeProvider theme={{ name: "dark" }}>
        <CameraField
          {...defaultProps}
          value={{
            lat: 35,
            lng: 139,
            height: 1000,
            heading: 0,
            pitch: 0,
            roll: 0,
            fov: 60
          }}
        />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText("Edit"));
    expect(screen.getByText("Camera Position Editor")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(mockOnSave).toHaveBeenCalled();
  });

  it("disables buttons when disabled prop is true", () => {
    render(
      <ThemeProvider theme={{ name: "dark" }}>
        <CameraField {...defaultProps} disabled={true} />
      </ThemeProvider>
    );

    expect(screen.getByText("Edit")).toBeDisabled();
    expect(screen.getByText("Capture")).toBeDisabled();
  });
});
