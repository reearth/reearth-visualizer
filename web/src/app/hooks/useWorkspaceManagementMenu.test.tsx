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
    vi.clearAllMocks();
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

  it("should return menu items for SaaS mode", () => {
    (config as Mock).mockReturnValue({ 
      saasMode: true, 
      platformUrl: "https://example.com" 
    });

    const workspaceId = "workspace-123";
    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId })
    );

    expect(result.current.workspaceManagementMenu.length).toBe(1);

    expect(result.current.workspaceManagementMenu[0]).toEqual({
      id: "accountSettings",
      title: "Account settings",
      icon: "user",
      dataTestid: "account-settings",
      onClick: expect.any(Function)
    });
  });

  it("should return full menu items for non-SaaS mode", () => {
    (config as Mock).mockReturnValue({ 
      saasMode: false
    });

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
      dataTestid: "add-workspace",
      onClick: expect.any(Function)
    });

    expect(result.current.workspaceManagementMenu[2]).toEqual({
      id: "accountSettings",
      title: "Account settings",
      icon: "user",
      dataTestid: "account-settings",
      onClick: expect.any(Function)
    });
  });

  it("should navigate to platform URL for account settings in SaaS mode", () => {
    const platformUrl = "https://example.com";
    (config as Mock).mockReturnValue({ 
      saasMode: true, 
      platformUrl 
    });

    const workspaceId = "workspace-123";
    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId })
    );

    result.current.workspaceManagementMenu[0].onClick?.("accountSettings");

    expect(mockNavigate).toHaveBeenCalledWith(`${platformUrl}/settings/profile`);
  });

  it("should navigate to local account settings in non-SaaS mode", () => {
    (config as Mock).mockReturnValue({ 
      saasMode: false
    });

    const workspaceId = "workspace-123";
    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId })
    );

    result.current.workspaceManagementMenu[2].onClick?.("accountSettings");

    expect(mockNavigate).toHaveBeenCalledWith("/settings/account");
  });

  it("should navigate to workspace settings in non-SaaS mode", () => {
    (config as Mock).mockReturnValue({ 
      saasMode: false
    });

    const workspaceId = "workspace-123";
    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId })
    );

    result.current.workspaceManagementMenu[0].onClick?.("workspaceSettings");

    expect(mockNavigate).toHaveBeenCalledWith(`/settings/workspaces/${workspaceId}`);
  });

  it("should have add workspace menu item with correct properties in non-SaaS mode", () => {
    (config as Mock).mockReturnValue({ 
      saasMode: false
    });

    const workspaceId = "workspace-123";
    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId })
    );

    expect(result.current.workspaceManagementMenu).toHaveLength(3);
    
    const addWorkspaceItem = result.current.workspaceManagementMenu[1];
    expect(addWorkspaceItem).toEqual({
      id: "addWorkspace",
      dataTestid: "add-workspace",
      title: "New workspace",
      icon: "newWorkspace",
      hasBorderBottom: true,
      onClick: expect.any(Function)
    });
  });
});
