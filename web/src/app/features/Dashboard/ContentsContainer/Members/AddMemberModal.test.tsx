import { fireEvent, render, screen } from "@reearth/test/utils";
import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AddMemberModal from "./AddMemberModal";

const mocks = vi.hoisted(() => ({
  found: undefined as { id: string; name: string; email: string } | undefined,
  addMemberToWorkspace: vi.fn()
}));

vi.mock("@reearth/services/api/user", async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useMe: () => ({ me: undefined, loading: false }),
  useSearchUser: () => ({ user: mocks.found, loading: false })
}));

vi.mock("@reearth/services/api/workspace", () => ({
  useWorkspaceMutations: () => ({
    addMemberToWorkspace: mocks.addMemberToWorkspace
  })
}));

const workspace = { id: "ws-1", name: "WS", members: [] };

const setup = () => {
  render(<AddMemberModal workspace={workspace} visible onClose={vi.fn()} />);
  return {
    addButton: screen.getByText("Add").closest("button") as HTMLButtonElement,
    input: screen.getAllByRole("textbox")[0]
  };
};

// The search box only matches on alias, so a typo silently matches nobody.
// Leaving Add enabled in that state invites a click that cannot do anything.
describe("AddMemberModal", () => {
  beforeEach(() => {
    mocks.found = undefined;
    mocks.addMemberToWorkspace.mockReset();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps Add disabled before anything has been searched for", () => {
    const { addButton } = setup();
    expect(addButton).toBeDisabled();
  });

  it("keeps Add disabled when the search matches nobody", () => {
    const { addButton, input } = setup();

    act(() => {
      fireEvent.change(input, { target: { value: "nobody" } });
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(addButton).toBeDisabled();
    expect(screen.getByText("Can't find the user")).toBeInTheDocument();
  });

  it("enables Add once the search finds someone", () => {
    mocks.found = { id: "u1", name: "Someone", email: "someone@example.com" };
    const { addButton, input } = setup();

    act(() => {
      fireEvent.change(input, { target: { value: "someone" } });
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(addButton).not.toBeDisabled();
  });
});
