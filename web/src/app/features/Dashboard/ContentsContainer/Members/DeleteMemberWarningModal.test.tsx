import { Role, WorkspaceMember } from "@reearth/services/gql";
import { fireEvent, render, screen, waitFor } from "@reearth/test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DeleteMemberWarningModal from "./DeleteMemberWarningModal";

const mocks = vi.hoisted(() => ({
  removeMemberFromWorkspace: vi.fn()
}));

vi.mock("@reearth/services/api/workspace", () => ({
  useWorkspaceMutations: () => ({
    removeMemberFromWorkspace: mocks.removeMemberFromWorkspace
  })
}));

const member: WorkspaceMember = {
  userId: "u1",
  role: Role.Writer,
  user: { id: "u1", name: "Writer One", email: "w1@example.com" }
};

const setup = (props: { member?: WorkspaceMember } = {}) => {
  const onClose = vi.fn();
  render(
    <DeleteMemberWarningModal
      workspace={{ id: "workspace-1", name: "WS", members: [member] }}
      member={"member" in props ? props.member : member}
      visible
      onClose={onClose}
    />
  );

  const removeButton = screen
    .getByText("Remove")
    .closest("button") as HTMLButtonElement;

  return { onClose, removeButton };
};

describe("DeleteMemberWarningModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.removeMemberFromWorkspace.mockResolvedValue({ status: "success" });
  });

  it("names the member being removed", () => {
    setup();
    expect(screen.getByText("Writer One")).toBeInTheDocument();
  });

  it("removes the member and closes on success", async () => {
    const { onClose, removeButton } = setup();

    fireEvent.click(removeButton);

    await waitFor(() =>
      expect(mocks.removeMemberFromWorkspace).toHaveBeenCalledWith({
        workspaceId: "workspace-1",
        userId: "u1"
      })
    );
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("stays open when the removal fails", async () => {
    mocks.removeMemberFromWorkspace.mockResolvedValue({ status: "error" });

    const { onClose, removeButton } = setup();

    fireEvent.click(removeButton);

    await waitFor(() =>
      expect(mocks.removeMemberFromWorkspace).toHaveBeenCalledTimes(1)
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("Writer One")).toBeInTheDocument();
  });

  it("does not fire a second removal while one is in flight", async () => {
    let resolveRemoval: (value: { status: string }) => void = () => undefined;
    mocks.removeMemberFromWorkspace.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRemoval = resolve;
        })
    );

    const { onClose, removeButton } = setup();

    fireEvent.click(removeButton);
    fireEvent.click(removeButton);

    expect(mocks.removeMemberFromWorkspace).toHaveBeenCalledTimes(1);
    // The modal is still open — it must not close before the removal resolves.
    expect(onClose).not.toHaveBeenCalled();

    resolveRemoval({ status: "success" });
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(mocks.removeMemberFromWorkspace).toHaveBeenCalledTimes(1);
  });

  it("does nothing without a member", () => {
    const { removeButton } = setup({ member: undefined });

    fireEvent.click(removeButton);

    expect(mocks.removeMemberFromWorkspace).not.toHaveBeenCalled();
  });

  it("closes without removing when cancelled", () => {
    const { onClose } = setup();

    fireEvent.click(screen.getByText("Cancel").closest("button") as Element);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mocks.removeMemberFromWorkspace).not.toHaveBeenCalled();
  });
});
