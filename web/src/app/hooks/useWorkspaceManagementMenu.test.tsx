import { appFeature } from "@reearth/services/config/appFeatureConfig";
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

vi.mock("@reearth/services/config/appFeatureConfig", () => ({
  appFeature: vi.fn(),
  generateExternalUrl: vi.fn((opts: { url?: string }) => opts.url ?? "")
}));

vi.mock("@reearth/services/i18n/hooks", () => ({
  useT: () => (key: string) => key,
  useLang: () => "en"
}));

vi.mock("@reearth/services/theme", () => ({
  useTheme: () => ({ content: { main: "#000" }, dangerous: { main: "#f00" } }),
  styled: () => () => "div"
}));

vi.mock("./useAvatarMenuItems", () => ({
  useAvatarMenuItems: () => []
}));

describe("useWorkspaceManagementMenu", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (appFeature as Mock).mockReturnValue({
      workspaceManagement: true,
      externalWorkspaceManagementUrl: undefined,
      membersManagementOnDashboard: true,
      externalMembersManagementUrl: undefined
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty workspaceManagementMenu when all workspace features are disabled", () => {
    (appFeature as Mock).mockReturnValue({
      workspaceManagement: false,
      externalWorkspaceManagementUrl: undefined,
      membersManagementOnDashboard: false,
      externalMembersManagementUrl: undefined
    });

    const { result } = renderHook(() => useWorkspaceManagementMenu({}));

    expect(result.current.workspaceManagementMenu).toEqual([]);
  });

  it("should show workspaceSettings when workspaceManagement is enabled", () => {
    (appFeature as Mock).mockReturnValue({
      workspaceManagement: true,
      externalWorkspaceManagementUrl: undefined,
      membersManagementOnDashboard: false,
      externalMembersManagementUrl: undefined
    });

    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId: "workspace-123" })
    );

    expect(result.current.workspaceManagementMenu).toHaveLength(1);
    expect(result.current.workspaceManagementMenu[0]).toEqual({
      id: "workspaceSettings",
      dataTestid: "workspace-settings",
      title: "Workspace settings",
      icon: "arrowExternalLink",
      iconPosition: "right",
      onClick: expect.any(Function)
    });
  });

  it("should show membersSettings when membersManagementOnDashboard is enabled", () => {
    (appFeature as Mock).mockReturnValue({
      workspaceManagement: false,
      externalWorkspaceManagementUrl: undefined,
      membersManagementOnDashboard: true,
      externalMembersManagementUrl: undefined
    });

    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId: "workspace-123" })
    );

    expect(result.current.workspaceManagementMenu).toHaveLength(1);
    expect(result.current.workspaceManagementMenu[0]).toEqual({
      id: "membersSettings",
      dataTestid: "members-settings",
      title: "Members",
      icon: "arrowExternalLink",
      iconPosition: "right",
      onClick: expect.any(Function)
    });
  });

  it("should show both workspaceSettings and membersSettings when both features are enabled", () => {
    (appFeature as Mock).mockReturnValue({
      workspaceManagement: true,
      externalWorkspaceManagementUrl: undefined,
      membersManagementOnDashboard: true,
      externalMembersManagementUrl: undefined
    });

    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId: "workspace-123" })
    );

    expect(result.current.workspaceManagementMenu).toHaveLength(2);
    expect(result.current.workspaceManagementMenu[0].id).toBe(
      "workspaceSettings"
    );
    expect(result.current.workspaceManagementMenu[1].id).toBe("membersSettings");
  });

  it("should navigate to workspace settings when no external URL is provided", () => {
    (appFeature as Mock).mockReturnValue({
      workspaceManagement: true,
      externalWorkspaceManagementUrl: undefined,
      membersManagementOnDashboard: false,
      externalMembersManagementUrl: undefined
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

  it("should open external URL when externalWorkspaceManagementUrl is provided", () => {
    const externalUrl = "https://external-platform.com/workspace";
    const mockWindowOpen = vi.fn();
    Object.defineProperty(window, "open", { value: mockWindowOpen, writable: true });

    (appFeature as Mock).mockReturnValue({
      workspaceManagement: false,
      externalWorkspaceManagementUrl: externalUrl,
      membersManagementOnDashboard: false,
      externalMembersManagementUrl: undefined
    });

    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId: "workspace-123" })
    );

    result.current.workspaceManagementMenu[0].onClick?.(
      result.current.workspaceManagementMenu[0].id
    );

    expect(mockWindowOpen).toHaveBeenCalledWith(externalUrl, "_blank");
  });

  it("should open external members URL when externalMembersManagementUrl is provided", () => {
    const externalUrl = "https://external-platform.com/members";
    const mockWindowOpen = vi.fn();
    Object.defineProperty(window, "open", { value: mockWindowOpen, writable: true });

    (appFeature as Mock).mockReturnValue({
      workspaceManagement: false,
      externalWorkspaceManagementUrl: undefined,
      membersManagementOnDashboard: false,
      externalMembersManagementUrl: externalUrl
    });

    const { result } = renderHook(() =>
      useWorkspaceManagementMenu({ workspaceId: "workspace-123" })
    );

    result.current.workspaceManagementMenu[0].onClick?.(
      result.current.workspaceManagementMenu[0].id
    );

    expect(mockWindowOpen).toHaveBeenCalledWith(externalUrl, "_blank");
  });

  it("should always return accountMenuItems with project-header, account, and documents", () => {
    const { result } = renderHook(() => useWorkspaceManagementMenu({}));

    const ids = result.current.accountMenuItems.map(item => item.id);
    expect(ids).toContain("project-header");
    expect(ids).toContain("account");
    expect(ids).toContain("documents");
  });
});
