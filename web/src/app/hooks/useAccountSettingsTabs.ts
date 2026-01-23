import { IconName } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { useMemo } from "react";

export const accountSettingTabs: {
  id: string;
  text: string;
  icon: IconName;
  path: string;
  disabled?: boolean;
}[] = [
  { id: "account", text: "Account", icon: "user", path: "/settings/account" },
  {
    id: "workspace",
    text: "Workspace",
    icon: "usersFour",
    path: "/settings/workspaces/:workspaceId"
  }
] as const;

type Tabs = typeof accountSettingTabs;

export default ({ workspaceId }: { workspaceId: string }): { tabs: Tabs } => {
  const t = useT();

  const tabs = useMemo(
    () =>
      accountSettingTabs.map((tab) => ({
        id: tab.id,
        icon: tab.icon,
        text: t(tab.text),
        path: tab.path.replace(":workspaceId", workspaceId),
        disabled: tab.disabled
      })),
    [t, workspaceId]
  );

  return {
    tabs
  };
};
