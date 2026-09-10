import { fireEvent, render, screen } from "@reearth/test/utils";
import { describe, expect, it, vi } from "vitest";

import ProjectDeleteModal from "./ProjectDeleteModal";

const setup = (props: Partial<Parameters<typeof ProjectDeleteModal>[0]> = {}) => {
  const onClose = vi.fn();
  const onProjectDelete = vi.fn();

  render(
    <ProjectDeleteModal
      isVisible
      projectName="My Project"
      onClose={onClose}
      onProjectDelete={onProjectDelete}
      {...props}
    />
  );

  const deleteButton = screen
    .getByText("I am sure I want to delete this project")
    .closest("button") as HTMLButtonElement;

  return { onClose, onProjectDelete, deleteButton };
};

const typeName = (value: string) => {
  fireEvent.change(screen.getByRole("textbox"), { target: { value } });
  fireEvent.blur(screen.getByRole("textbox"));
};

describe("ProjectDeleteModal", () => {
  it("keeps the delete button disabled until the project name is typed", () => {
    const { deleteButton, onProjectDelete } = setup();

    expect(deleteButton).toBeDisabled();

    typeName("Wrong Name");
    expect(deleteButton).toBeDisabled();

    typeName("My Project");
    expect(deleteButton).not.toBeDisabled();

    fireEvent.click(deleteButton);
    expect(onProjectDelete).toHaveBeenCalledTimes(1);
  });

  it("accepts a confirmation with surrounding whitespace", () => {
    const { deleteButton } = setup();

    typeName("  My Project  ");
    expect(deleteButton).not.toBeDisabled();
  });

  it("stays disabled for an unnamed project instead of accepting an empty input", () => {
    const { deleteButton } = setup({ projectName: "" });

    expect(deleteButton).toBeDisabled();

    typeName("");
    expect(deleteButton).toBeDisabled();
  });

  it("stays disabled while a delete is already running", () => {
    const { deleteButton } = setup({ disabled: true });

    typeName("My Project");
    expect(deleteButton).toBeDisabled();
  });

  it("closes from both the cancel button and the panel close action", () => {
    const { onClose } = setup();

    fireEvent.click(screen.getByText("Cancel").closest("button") as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
