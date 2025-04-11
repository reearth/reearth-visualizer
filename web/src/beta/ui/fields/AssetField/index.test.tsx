import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { render, screen } from "../../../../test/utils";

import AssetField from "./index";

// Mock dependencies
vi.mock("@reearth/beta/features/AssetsManager/AssetsSelector", () => ({
  default: ({
    opened,
    onClose,
    onAssetSelect
  }: {
    opened: boolean;
    onClose: () => void;
    onAssetSelect: (url: string, name: string) => void;
  }) =>
    opened ? (
      <div data-testid="assets-selector">
        <button
          data-testid="select-asset-button"
          onClick={() =>
            onAssetSelect("https://example.com/image.jpg", "image.jpg")
          }
        >
          Select Asset
        </button>
        <button data-testid="close-modal-button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null
}));

vi.mock("@reearth/beta/lib/reearth-ui", () => ({
  TextInput: ({
    value,
    onChange,
    onBlur,
    placeholder
  }: {
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
  }) => (
    <input
      data-testid="text-input"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={() => onBlur?.()}
      placeholder={placeholder}
    />
  ),
  Button: ({
    onClick,
    title,
    disabled,
    icon
  }: {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    title?: string;
    disabled?: boolean;
    icon?: string;
  }) => (
    <button
      data-testid={`button${icon ? `-${icon}` : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {title}
    </button>
  )
}));

vi.mock("@reearth/services/i18n", () => ({
  useT: () => (key: string) => key
}));

vi.mock("@reearth/services/state", () => ({
  useNotification: () => [null, vi.fn()],
  useProjectId: () => ["project-id"],
  useWorkspace: () => [{ id: "workspace-id" }]
}));

vi.mock("../CommonField", () => ({
  default: ({
    children,
    title,
    description
  }: {
    children?: React.ReactNode;
    title?: string;
    description?: string;
  }) => (
    <div data-testid="common-field">
      {title && <div data-testid="field-title">{title}</div>}
      {description && <div data-testid="field-description">{description}</div>}
      {children}
    </div>
  )
}));

vi.mock("./useAssetUpload", () => ({
  default: () => ({ handleFileUpload: vi.fn() })
}));

describe("AssetField", () => {
  const defaultProps: {
    title: string;
    description: string;
    inputMethod: "asset" | "URL" | undefined;
  } = {
    title: "Asset Field Title",
    description: "Asset Field Description",
    inputMethod: "asset"
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders AssetField without any props", () => {
    render(<AssetField />);
    expect(screen.getByTestId("common-field")).toBeDefined();
    expect(screen.getByTestId("text-input")).toBeDefined();
    expect(screen.queryByTestId("button")).toBeNull();
  });

  it("renders with default props", () => {
    render(<AssetField {...defaultProps} />);

    expect(screen.getByTestId("common-field")).toBeDefined();
    expect(screen.getByTestId("field-title")).toHaveTextContent(
      "Asset Field Title"
    );
    expect(screen.getByTestId("field-description")).toHaveTextContent(
      "Asset Field Description"
    );
    expect(screen.getByTestId("text-input")).toBeDefined();
    expect(screen.getByTestId("button-image")).toBeDefined();
    expect(screen.getByTestId("button-uploadSimple")).toBeDefined();
  });
});
