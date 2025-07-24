import { ThemeProvider } from "@aws-amplify/ui-react";
import { render, screen, fireEvent } from "@reearth/test/utils";
import React from "react";
import { describe, it, expect, vi, test } from "vitest";

import CapturePanel from "./CapturePanel";

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

describe("CapturePanel Component", () => {
  const mockCamera = {
    lat: 35.6812,
    lng: 139.7671,
    height: 1000,
    heading: 0.5,
    pitch: 0.3,
    roll: 0.1,
    fov: 1.0
  };

  test("renders position and rotation fields with correct values", () => {
    render(
      <CapturePanel camera={mockCamera} onClose={() => {}} onSave={() => {}} />
    );

    expect(screen.getByText("Current Position")).toBeInTheDocument();
    expect(screen.getByText("Current Rotation")).toBeInTheDocument();

    const inputFields = screen.getAllByRole("textbox");
    expect(inputFields[0]).toHaveValue("35.6812");
    expect(inputFields[1]).toHaveValue("139.7671");
    expect(inputFields[2]).toHaveValue("1000");

    // Values should be converted from radians to degrees
    expect(inputFields[3]).toHaveValue(((0.5 * 180) / Math.PI).toString());
    expect(inputFields[4]).toHaveValue(((0.3 * 180) / Math.PI).toString());
  });

  test("renders FOV slider when withFOV is true", () => {
    render(
      <CapturePanel
        camera={mockCamera}
        withFOV
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    expect(screen.getByText("FOV")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveValue(1);
  });

  test("doesn't render FOV slider when withFOV is false", () => {
    render(
      <CapturePanel
        camera={mockCamera}
        withFOV={false}
        onClose={() => {}}
        onSave={() => {}}
      />
    );

    expect(screen.queryByText("FOV")).not.toBeInTheDocument();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  });

  test("calls onSave with camera when Apply button is clicked", () => {
    const handleSave = vi.fn();
    render(
      <CapturePanel
        camera={mockCamera}
        onClose={() => {}}
        onSave={handleSave}
      />
    );

    const applyButton = screen.getByText("Apply");
    fireEvent.click(applyButton);

    expect(handleSave).toHaveBeenCalledWith(mockCamera);
  });

  test("calls onClose when Cancel button is clicked", () => {
    const handleClose = vi.fn();
    render(
      <CapturePanel
        camera={mockCamera}
        onClose={handleClose}
        onSave={() => {}}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalled();
  });
});
