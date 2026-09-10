import { fireEvent, render, screen } from "@reearth/test/utils";
import { describe, expect, it, vi } from "vitest";

import ProjectRemoveModal from "./ProjectRemoveModal";

describe("ProjectRemoveModal", () => {
  it("renders the recycle bin warning when visible", () => {
    render(
      <ProjectRemoveModal
        isVisible
        onClose={vi.fn()}
        onProjectRemove={vi.fn()}
      />
    );

    expect(
      screen.getByText("Your project will be moved to Recycle Bin.")
    ).toBeInTheDocument();
  });

  it("renders nothing when not visible", () => {
    render(
      <ProjectRemoveModal
        isVisible={false}
        onClose={vi.fn()}
        onProjectRemove={vi.fn()}
      />
    );

    expect(
      screen.queryByText("Your project will be moved to Recycle Bin.")
    ).not.toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    const onProjectRemove = vi.fn();
    render(
      <ProjectRemoveModal
        isVisible
        onClose={onClose}
        onProjectRemove={onProjectRemove}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onProjectRemove).not.toHaveBeenCalled();
  });

  it("calls onProjectRemove when Remove is clicked", () => {
    const onProjectRemove = vi.fn();
    render(
      <ProjectRemoveModal
        isVisible
        onClose={vi.fn()}
        onProjectRemove={onProjectRemove}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(onProjectRemove).toHaveBeenCalledTimes(1);
  });

  it("disables the Remove button while a removal is in progress", () => {
    render(
      <ProjectRemoveModal
        isVisible
        disabled
        onClose={vi.fn()}
        onProjectRemove={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Remove" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
  });
});
