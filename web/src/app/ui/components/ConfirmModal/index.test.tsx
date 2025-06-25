import { render, screen } from "@reearth/test/utils";
import { describe, test, expect } from "vitest";

import ConfirmModal from "./index";

describe("ConfirmModal Component", () => {
  test("renders when visible is true", () => {
    render(
      <ConfirmModal
        visible
        title="Confirm Action"
        description="Are you sure you want to continue?"
      />
    );

    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to continue?")
    ).toBeInTheDocument();
  });

  test("does not render when visible is false", () => {
    render(
      <ConfirmModal
        visible={false}
        title="Confirm Action"
        description="Are you sure you want to continue?"
      />
    );

    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Are you sure you want to continue?")
    ).not.toBeInTheDocument();
  });

  test("renders warning icon", () => {
    render(<ConfirmModal visible title="Confirm Action" />);

    expect(document.querySelector("svg")).toBeInTheDocument();
  });

  test("renders custom actions", () => {
    const actions = (
      <div data-testid="custom-actions">
        <button>Cancel</button>
        <button>Confirm</button>
      </div>
    );

    render(<ConfirmModal visible title="Confirm Action" actions={actions} />);

    expect(screen.getByTestId("custom-actions")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });
});
