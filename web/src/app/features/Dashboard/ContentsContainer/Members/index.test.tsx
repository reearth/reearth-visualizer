import { Role, WorkspaceMember } from "@reearth/services/gql";
import { fireEvent, render, screen } from "@reearth/test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Members from ".";

const mocks = vi.hoisted(() => ({
  workspace: undefined as { id: string; members: WorkspaceMember[] } | undefined,
  me: { id: "me" } as { id: string } | undefined,
  membersManagementOnDashboard: true
}));

vi.mock("@reearth/services/api/workspace", () => ({
  useWorkspace: () => ({ workspace: mocks.workspace })
}));

vi.mock("@reearth/services/api/user", () => ({
  useMe: () => ({ me: mocks.me })
}));

vi.mock("@reearth/services/config/appFeatureConfig", () => ({
  appFeature: () => ({
    membersManagementOnDashboard: mocks.membersManagementOnDashboard
  })
}));

// Rendered as plain markup so the container's own logic (ordering, filtering and
// the last-owner rule) can be asserted without driving the popup menu.
vi.mock("./ListItem", () => ({
  default: ({
    member,
    isLastOwner
  }: {
    member: WorkspaceMember;
    isLastOwner: boolean;
  }) => (
    <div data-testid="member-row" data-last-owner={String(isLastOwner)}>
      {member.user?.name}
    </div>
  )
}));

vi.mock("./AddMemberModal", () => ({
  default: () => <div data-testid="add-member-modal" />
}));
vi.mock("./UpdateRoleModal", () => ({ default: () => null }));
vi.mock("./DeleteMemberWarningModal", () => ({ default: () => null }));

const member = (
  id: string,
  name: string,
  role: Role,
  email = `${id}@example.com`
): WorkspaceMember => ({
  userId: id,
  role,
  user: { id, name, email }
});

// Frozen on purpose: Apollo deep-freezes cache results in development, so any
// in-place mutation of this array would throw.
const frozenWorkspace = (members: WorkspaceMember[]) => ({
  id: "workspace-1",
  members: Object.freeze(members) as WorkspaceMember[]
});

const rowNames = () =>
  screen.getAllByTestId("member-row").map((el) => el.textContent);

describe("Members", () => {
  beforeEach(() => {
    mocks.me = { id: "me" };
    mocks.membersManagementOnDashboard = true;
    mocks.workspace = frozenWorkspace([
      member("w1", "Zoe", Role.Writer),
      member("me", "Owner One", Role.Owner),
      member("r1", "Aaron", Role.Reader),
      member("w2", "Adam", Role.Writer)
    ]);
  });

  it("renders members sorted by role then name without mutating the cached list", () => {
    const original = [...(mocks.workspace?.members ?? [])];

    render(<Members currentWorkspace={{ id: "workspace-1", name: "WS" }} />);

    expect(rowNames()).toEqual(["Owner One", "Adam", "Zoe", "Aaron"]);
    // The Apollo-owned array is left in its original order.
    expect(mocks.workspace?.members).toEqual(original);
  });

  it("filters by name and by email", () => {
    render(<Members currentWorkspace={{ id: "workspace-1", name: "WS" }} />);

    const search = screen.getByPlaceholderText(
      "Search member by name or email"
    );

    fireEvent.change(search, { target: { value: "ad" } });
    fireEvent.blur(search);
    expect(rowNames()).toEqual(["Adam"]);

    fireEvent.change(search, { target: { value: "r1@example.com" } });
    fireEvent.blur(search);
    expect(rowNames()).toEqual(["Aaron"]);
  });

  it("shows the empty state when nothing matches the search", () => {
    render(<Members currentWorkspace={{ id: "workspace-1", name: "WS" }} />);

    const search = screen.getByPlaceholderText(
      "Search member by name or email"
    );
    fireEvent.change(search, { target: { value: "nobody" } });
    fireEvent.blur(search);

    expect(screen.queryAllByTestId("member-row")).toHaveLength(0);
    expect(screen.getByText("No Member match your search.")).toBeInTheDocument();
  });

  it("keeps the active search applied after the member list is refetched", () => {
    const { rerender } = render(
      <Members currentWorkspace={{ id: "workspace-1", name: "WS" }} />
    );

    const search = screen.getByPlaceholderText(
      "Search member by name or email"
    );
    fireEvent.change(search, { target: { value: "ad" } });
    fireEvent.blur(search);
    expect(rowNames()).toEqual(["Adam"]);

    // A refetch (e.g. after an invite) hands back a brand new members array.
    mocks.workspace = frozenWorkspace([
      member("w1", "Zoe", Role.Writer),
      member("me", "Owner One", Role.Owner),
      member("r1", "Aaron", Role.Reader),
      member("w2", "Adam", Role.Writer),
      member("r2", "Newcomer", Role.Reader)
    ]);
    rerender(<Members currentWorkspace={{ id: "workspace-1", name: "WS" }} />);

    expect(rowNames()).toEqual(["Adam"]);
    expect(search).toHaveValue("ad");
  });

  describe("last owner protection", () => {
    it("marks the only owner as the last owner and nobody else", () => {
      render(<Members currentWorkspace={{ id: "workspace-1", name: "WS" }} />);

      const rows = screen.getAllByTestId("member-row");
      const flags = Object.fromEntries(
        rows.map((el) => [el.textContent, el.dataset.lastOwner])
      );

      expect(flags).toEqual({
        "Owner One": "true",
        Adam: "false",
        Zoe: "false",
        Aaron: "false"
      });
    });

    it("does not protect owners once a second owner exists", () => {
      mocks.workspace = frozenWorkspace([
        member("me", "Owner One", Role.Owner),
        member("o2", "Owner Two", Role.Owner)
      ]);

      render(<Members currentWorkspace={{ id: "workspace-1", name: "WS" }} />);

      expect(
        screen
          .getAllByTestId("member-row")
          .map((el) => el.dataset.lastOwner)
      ).toEqual(["false", "false"]);
    });

    it("does not protect a non-owner just because the search narrows to one row", () => {
      render(<Members currentWorkspace={{ id: "workspace-1", name: "WS" }} />);

      const search = screen.getByPlaceholderText(
        "Search member by name or email"
      );
      fireEvent.change(search, { target: { value: "Aaron" } });
      fireEvent.blur(search);

      const rows = screen.getAllByTestId("member-row");
      expect(rows).toHaveLength(1);
      expect(rows[0].dataset.lastOwner).toBe("false");
    });
  });

  describe("invite button", () => {
    it("is shown to an owner", () => {
      render(<Members currentWorkspace={{ id: "workspace-1", name: "WS" }} />);
      expect(screen.getByText("invite user")).toBeInTheDocument();
    });

    it("is hidden from a writer", () => {
      mocks.workspace = frozenWorkspace([
        member("me", "Me", Role.Writer),
        member("o1", "Owner One", Role.Owner)
      ]);

      render(<Members currentWorkspace={{ id: "workspace-1", name: "WS" }} />);
      expect(screen.queryByText("invite user")).not.toBeInTheDocument();
    });

    it("opens the add-member modal", () => {
      render(<Members currentWorkspace={{ id: "workspace-1", name: "WS" }} />);

      expect(screen.queryByTestId("add-member-modal")).not.toBeInTheDocument();
      fireEvent.click(screen.getByText("invite user").closest("button") as Element);
      expect(screen.getByTestId("add-member-modal")).toBeInTheDocument();
    });
  });

  it("renders nothing when member management is disabled", () => {
    mocks.membersManagementOnDashboard = false;

    const { container } = render(
      <Members currentWorkspace={{ id: "workspace-1", name: "WS" }} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
