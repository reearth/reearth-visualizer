import { config } from "@reearth/services/config";
import { useAddWorkspaceModal } from "@reearth/services/state";
import { renderHook } from "@reearth/test/utils";
import { useNavigate } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";

import useWorkspaceManagementMenu from "./useWorkspaceManagementMenu";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn()
}));

vi.mock("@reearth/services/state", () => ({
  useAddWorkspaceModal: vi.fn(() => [false, vi.fn()])
}));

vi.mock("@reearth/services/config", () => ({
  config: vi.fn()
}));

describe("useWorkspaceManagementMenu", () => {
  const mockNavigate = vi.fn();
  const mockSetAddWorkspaceModal = vi.fn();

  beforeEach(() => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useAddWorkspaceModal as Mock).mockReturnValue([
      false,
      mockSetAddWorkspaceModal
    ]);
    (config as Mock).mockReturnValue({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty menu when workspaceId is not provided", () => {
    const { result } = renderHook(() => useWorkspaceManagementMenu({}));

    expect(result.current.workspaceManagementMenu).toEqual([]);
  });

  it("should return empty menu when workspace management is disabled", () => {
    (config as Mock).mockReturnValue({ disableWorkspaceManagement: true });

    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId: "workspace-123" })
    );

    expect(result.current.workspaceManagementMenu).toEqual([]);
  });

  it("should return menu items when workspaceId is provided and management is enabled", () => {
    const workspaceId = "workspace-123";
    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId })
    );

    expect(result.current.workspaceManagementMenu.length).toBe(3);

    expect(result.current.workspaceManagementMenu[0]).toEqual({
      id: "workspaceSettings",
      title: "Workspace settings",
      icon: "setting",
      dataTestid: "workspace-settings",
      onClick: expect.any(Function)
    });

    expect(result.current.workspaceManagementMenu[1]).toEqual({
      id: "addWorkspace",
      title: "New workspace",
      icon: "newWorkspace",
      hasBorderBottom: true,
      onClick: expect.any(Function)
    });

    expect(result.current.workspaceManagementMenu[2]).toEqual({
      id: "accountSettings",
      title: "Account settings",
      icon: "user",
      onClick: expect.any(Function)
    });

    expect(result.current.workspaceManagementMenu[0].onClick).toBeDefined();
  });
});
