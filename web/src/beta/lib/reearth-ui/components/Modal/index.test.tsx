import { render, screen } from "@reearth/test/utils";
import React from "react";
import { vi, describe, test, expect, beforeEach } from "vitest";

import { Modal } from "./index";

describe("Modal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders nothing when visible is false", () => {
    const { container } = render(
      <Modal visible={false}>
        <div data-testid="modal-content">Modal Content</div>
      </Modal>
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
  });

  test("renders content when visible is true", () => {
    render(
      <Modal visible={true}>
        <div data-testid="modal-content">Modal Content</div>
      </Modal>
    );

    const content = screen.getByTestId("modal-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Modal Content");
  });

  test("applies small size correctly", () => {
    render(
      <Modal visible={true} size="small">
        <div data-testid="modal-content">Small Modal</div>
      </Modal>
    );

    const content = screen.getByTestId("modal-content");
    const contentWrapper = content.parentElement;

    expect(contentWrapper).toHaveStyle("width: 416px");
  });

  test("applies medium size (default) correctly", () => {
    render(
      <Modal visible={true}>
        <div data-testid="modal-content">Medium Modal</div>
      </Modal>
    );

    const content = screen.getByTestId("modal-content");
    const contentWrapper = content.parentElement;

    expect(contentWrapper).toHaveStyle("width: 572px");
  });

  test("applies large size correctly", () => {
    render(
      <Modal visible={true} size="large">
        <div data-testid="modal-content">Large Modal</div>
      </Modal>
    );

    const content = screen.getByTestId("modal-content");
    const contentWrapper = content.parentElement;

    expect(contentWrapper).toHaveStyle("width: 778px");
  });

  test("renders complex nested content", () => {
    render(
      <Modal visible={true}>
        <div data-testid="header">Header</div>
        <div data-testid="body">Body Content</div>
        <button data-testid="close-button">Close</button>
      </Modal>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("body")).toBeInTheDocument();
    expect(screen.getByTestId("close-button")).toBeInTheDocument();
  });

  test("renders correctly with default props", () => {
    render(
      <Modal visible={true}>
        <div data-testid="modal-content">Default Modal</div>
      </Modal>
    );

    expect(screen.getByTestId("modal-content")).toBeInTheDocument();

    const content = screen.getByTestId("modal-content");
    const contentWrapper = content.parentElement;
    expect(contentWrapper).toHaveStyle("width: 572px");
  });
});
