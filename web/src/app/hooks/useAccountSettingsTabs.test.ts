import { renderHook } from "@reearth/test/utils";
import { describe, expect, it } from "vitest";

import useAccountSettingsTabs, {
  accountSettingTabs
} from "./useAccountSettingsTabs";

describe("useAccountSettingsTabs", () => {
  it("should return tabs with workspace ID injected into paths", () => {
    const workspaceId = "test-workspace-123";
    const { result } = renderHook(() =>
      useAccountSettingsTabs({ workspaceId })
    );

    expect(result.current.tabs).toHaveLength(accountSettingTabs.length);

    const workspaceTab = result.current.tabs.find(
      (tab) => tab.id === "workspace"
    );
    expect(workspaceTab).toBeDefined();
    expect(workspaceTab?.path).toBe("/settings/workspaces/test-workspace-123");
  });

  it("should preserve other tab properties like icon and disabled", () => {
    const workspaceId = "any-id";
    const { result } = renderHook(() =>
      useAccountSettingsTabs({ workspaceId })
    );

    result.current.tabs.forEach((tab, index) => {
      expect(tab.icon).toBe(accountSettingTabs[index].icon);
      expect(tab.disabled).toBe(accountSettingTabs[index].disabled);
    });
  });

  it("should re-render when workspaceId changes", () => {
    const { result, rerender } = renderHook(
      ({ workspaceId }) => useAccountSettingsTabs({ workspaceId }),
      { initialProps: { workspaceId: "workspace-1" } }
    );

    const initialWorkspaceTabPath = result.current.tabs.find(
      (tab) => tab.id === "workspace"
    )?.path;

    rerender({ workspaceId: "workspace-2" });

    const updatedWorkspaceTabPath = result.current.tabs.find(
      (tab) => tab.id === "workspace"
    )?.path;

    expect(initialWorkspaceTabPath).toBe("/settings/workspaces/workspace-1");
    expect(updatedWorkspaceTabPath).toBe("/settings/workspaces/workspace-2");
  });
});
