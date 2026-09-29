import { Role, WorkspaceMember } from "@reearth/services/gql";
import { fireEvent, render, screen, waitFor } from "@reearth/test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UpdateRoleModal from "./UpdateRoleModal";

const mocks = vi.hoisted(() => ({
  updateMemberOfWorkspace: vi.fn()
}));

vi.mock("@reearth/services/api/workspace", () => ({
  useWorkspaceMutations: () => ({
    updateMemberOfWorkspace: mocks.updateMemberOfWorkspace
  })
}));

const member: WorkspaceMember = {
  userId: "u1",
  role: Role.Reader,
  user: { id: "u1", name: "Reader One", email: "r1@example.com" }
};

const setup = () => {
  const onClose = vi.fn();
  render(
    <UpdateRoleModal
      workspace={{ id: "workspace-1", name: "WS", members: [member] }}
      member={member}
      visible
      onClose={onClose}
      meRole={Role.Owner}
    />
  );

  const updateButton = screen
    .getByText("Update")
    .closest("button") as HTMLButtonElement;

  return { onClose, updateButton };
};

const selectRole = (label: string) => {
  fireEvent.click(screen.getByText("READER"));
  fireEvent.click(screen.getByText(label));
};

describe("UpdateRoleModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateMemberOfWorkspace.mockResolvedValue({ status: "success" });
  });

  it("shows the role the user picked", () => {
    setup();

    selectRole("WRITER");

    expect(screen.getByText("WRITER")).toBeInTheDocument();
    expect(screen.queryByText("READER")).not.toBeInTheDocument();
  });

  it("keeps Update disabled until a different role is chosen", () => {
    const { updateButton } = setup();

    expect(updateButton).toBeDisabled();

    selectRole("WRITER");
    expect(updateButton).not.toBeDisabled();
  });

  it("submits the picked role and closes on success", async () => {
    const { onClose, updateButton } = setup();

    selectRole("WRITER");
    fireEvent.click(updateButton);

    await waitFor(() =>
      expect(mocks.updateMemberOfWorkspace).toHaveBeenCalledWith({
        workspaceId: "workspace-1",
        userId: "u1",
        role: Role.Writer
      })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("stays open when the update fails so the picked role is not lost", async () => {
    mocks.updateMemberOfWorkspace.mockResolvedValue({ status: "error" });

    const { onClose, updateButton } = setup();

    selectRole("WRITER");
    fireEvent.click(updateButton);

    await waitFor(() =>
      expect(mocks.updateMemberOfWorkspace).toHaveBeenCalledTimes(1)
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("WRITER")).toBeInTheDocument();
  });

  it("does not submit twice while an update is in flight", async () => {
    let resolveUpdate: (value: { status: string }) => void = () => undefined;
    mocks.updateMemberOfWorkspace.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        })
    );

    const { updateButton } = setup();

    selectRole("WRITER");
    fireEvent.click(updateButton);
    fireEvent.click(updateButton);

    expect(mocks.updateMemberOfWorkspace).toHaveBeenCalledTimes(1);

    resolveUpdate({ status: "success" });
    await waitFor(() =>
      expect(mocks.updateMemberOfWorkspace).toHaveBeenCalledTimes(1)
    );
  });

  it("closes without submitting when cancelled", () => {
    const { onClose } = setup();

    fireEvent.click(screen.getByText("Cancel").closest("button") as Element);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.updateMemberOfWorkspace).not.toHaveBeenCalled();
  });
});
