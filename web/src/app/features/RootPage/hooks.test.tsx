import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useHooks from "./hooks";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockSetCurrentWorkspace = vi.fn();
const mockSetCurrentUserId = vi.fn();
const mockSetNotification = vi.fn();

const myWorkspace = { id: "ws-personal", name: "My Workspace" };

let mockCurrentWorkspace: { id: string; personal?: boolean } | undefined =
  undefined;
let mockIsAuthenticated = true;
let mockData: { me?: { id: string; myWorkspace?: typeof myWorkspace } | null } =
  { me: { id: "user-1", myWorkspace } };

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate
}));

vi.mock("@reearth/services/i18n/hooks", () => ({
  useT: () => (s: string) => s
}));

vi.mock("@reearth/services/auth/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    isLoading: false,
    error: undefined,
    login: mockLogin,
    logout: mockLogout
  }),
  useCleanUrl: () => [undefined, true]
}));

vi.mock("@reearth/services/api/workspace", () => ({
  useWorkspaces: () => ({ data: mockData, loading: false })
}));

vi.mock("@reearth/services/state", () => ({
  useWorkspace: () => [mockCurrentWorkspace, mockSetCurrentWorkspace],
  useUserId: () => ["user-1", mockSetCurrentUserId],
  useNotification: () => [undefined, mockSetNotification]
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockCurrentWorkspace = undefined;
  mockIsAuthenticated = true;
  mockData = { me: { id: "user-1", myWorkspace } };
});

describe("RootPage hooks — workspace loop prevention", () => {
  it("sets personal workspace when no current workspace is set", () => {
    mockCurrentWorkspace = undefined;
    renderHook(() => useHooks());
    expect(mockSetCurrentWorkspace).toHaveBeenCalledWith({
      ...myWorkspace,
      personal: true
    });
  });

  it("does not call setCurrentWorkspace when already on the same personal workspace", () => {
    mockCurrentWorkspace = { id: myWorkspace.id, personal: true };
    renderHook(() => useHooks());
    expect(mockSetCurrentWorkspace).not.toHaveBeenCalled();
  });

  it("updates workspace when the id has changed", () => {
    mockCurrentWorkspace = { id: "ws-old", personal: true };
    renderHook(() => useHooks());
    expect(mockSetCurrentWorkspace).toHaveBeenCalledWith({
      ...myWorkspace,
      personal: true
    });
  });

  it("updates workspace when personal flag is missing even if id matches", () => {
    mockCurrentWorkspace = { id: myWorkspace.id, personal: false };
    renderHook(() => useHooks());
    expect(mockSetCurrentWorkspace).toHaveBeenCalledWith({
      ...myWorkspace,
      personal: true
    });
  });

  it("does not set workspace when myWorkspace is absent from the response", () => {
    mockData = { me: { id: "user-1", myWorkspace: undefined } };
    renderHook(() => useHooks());
    expect(mockSetCurrentWorkspace).not.toHaveBeenCalled();
  });

  it("navigates to dashboard with workspaceId after auth", () => {
    mockCurrentWorkspace = { id: myWorkspace.id, personal: true };
    renderHook(() => useHooks());
    expect(mockNavigate).toHaveBeenCalledWith(
      `/dashboard/${myWorkspace.id}`
    );
  });

  it("calls login when not authenticated and not loading", () => {
    mockIsAuthenticated = false;
    renderHook(() => useHooks());
    expect(mockLogin).toHaveBeenCalled();
    expect(mockSetCurrentWorkspace).not.toHaveBeenCalled();
  });
});
