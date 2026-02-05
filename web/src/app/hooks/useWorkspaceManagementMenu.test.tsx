import { appFeature } from "@reearth/services/config/appFeatureConfig";
import { useAddWorkspaceModal } from "@reearth/services/state";
import { renderHook } from "@reearth/test/utils";
import { useNavigate } from "react-router";
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";

import useWorkspaceManagementMenu from "./useWorkspaceManagementMenu";

vi.mock("react-router", () => ({
  useNavigate: vi.fn(),
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  )
}));

vi.mock("@reearth/services/state", () => ({
  useAddWorkspaceModal: vi.fn()
}));

vi.mock("@reearth/services/config/appFeatureConfig", () => ({
  appFeature: vi.fn()
}));

vi.mock("@reearth/services/i18n", () => ({
  useT: () => (key: string) => key
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
    (appFeature as Mock).mockReturnValue({
      workspaceCreation: true,
      workspaceManagement: true,
      accountManagement: true,
      externalAccountManagementUrl: undefined
    });

    // Reset the mock function call count
    mockSetAddWorkspaceModal.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty menu when all features are disabled", () => {
    (appFeature as Mock).mockReturnValue({
      workspaceCreation: false,
      workspaceManagement: false,
      accountManagement: false,
      externalAccountManagementUrl: undefined
    });

    const { result } = renderHook(() => useWorkspaceManagementMenu({}));

    expect(result.current.workspaceManagementMenu).toEqual([]);
  });

  it("should return only account settings when only account management is enabled", () => {
    (appFeature as Mock).mockReturnValue({
      workspaceCreation: false,
      workspaceManagement: false,
      accountManagement: true,
      externalAccountManagementUrl: undefined
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

  it("should return full menu items when all features are enabled", () => {
    (appFeature as Mock).mockReturnValue({
      workspaceCreation: true,
      workspaceManagement: true,
      accountManagement: true,
      externalAccountManagementUrl: undefined
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

  it("should open external URL when externalAccountManagementUrl is provided", () => {
    const externalUrl = "https://external-platform.com/account";
    const mockWindowOpen = vi.fn();
    Object.defineProperty(window, "open", {
      value: mockWindowOpen,
      writable: true
    });

    (appFeature as Mock).mockReturnValue({
      workspaceCreation: false,
      workspaceManagement: false,
      accountManagement: false,
      externalAccountManagementUrl: externalUrl
    });

    const workspaceId = "workspace-123";
    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId })
    );

    result.current.workspaceManagementMenu[0].onClick?.(
      result.current.workspaceManagementMenu[0].id
    );

    expect(mockWindowOpen).toHaveBeenCalledWith(externalUrl, "_blank");
  });

  it("should navigate to local account settings when no external URL is provided", () => {
    (appFeature as Mock).mockReturnValue({
      workspaceCreation: true,
      workspaceManagement: true,
      accountManagement: true,
      externalAccountManagementUrl: undefined
    });

    const workspaceId = "workspace-123";
    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId })
    );

    result.current.workspaceManagementMenu[2].onClick?.(
      result.current.workspaceManagementMenu[2].id
    );

    expect(mockNavigate).toHaveBeenCalledWith("/settings/account");
  });

  it("should navigate to workspace settings when workspace management is enabled", () => {
    (appFeature as Mock).mockReturnValue({
      workspaceCreation: false,
      workspaceManagement: true,
      accountManagement: false,
      externalAccountManagementUrl: undefined
    });

    const workspaceId = "workspace-123";
    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId })
    );

    result.current.workspaceManagementMenu[0].onClick?.(
      result.current.workspaceManagementMenu[0].id
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      `/settings/workspaces/${workspaceId}`
    );
  });

  it("should show add workspace item when workspace creation is enabled", () => {
    (appFeature as Mock).mockReturnValue({
      workspaceCreation: true,
      workspaceManagement: false,
      accountManagement: false,
      externalAccountManagementUrl: undefined
    });

    const workspaceId = "workspace-123";
    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId })
    );

    expect(result.current.workspaceManagementMenu).toHaveLength(1);
    expect(result.current.workspaceManagementMenu[0]).toEqual({
      id: "addWorkspace",
      dataTestid: "add-workspace",
      title: "New workspace",
      icon: "newWorkspace",
      hasBorderBottom: true,
      onClick: expect.any(Function)
    });
  });

  it("should only show workspace settings when only workspace management is enabled", () => {
    (appFeature as Mock).mockReturnValue({
      workspaceCreation: false,
      workspaceManagement: true,
      accountManagement: false,
      externalAccountManagementUrl: undefined
    });

    const workspaceId = "workspace-123";
    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId })
    );

    expect(result.current.workspaceManagementMenu).toHaveLength(1);
    expect(result.current.workspaceManagementMenu[0].id).toBe(
      "workspaceSettings"
    );
  });
});
