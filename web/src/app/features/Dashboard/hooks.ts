import { useMeFetcher } from "@reearth/services/api";
import { useAuth } from "@reearth/services/auth";
import { config } from "@reearth/services/config";
import { useWorkspace } from "@reearth/services/state";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { TabItems, Workspace } from "./type";

type Props = {
  bottomTabsItems: Omit<TabItems[], "active">;
  topTabItems: Omit<TabItems[], "active">;
  workspaceId?: string;
};

export default ({ workspaceId, topTabItems, bottomTabsItems }: Props) => {
  const navigate = useNavigate();
  const { useMeQuery } = useMeFetcher();
  const { me: data } = useMeQuery();
  const { logout } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();

  const workspaces = (data?.teams as Workspace[]) ?? [];
  const workspace = workspaces.find(
    (workspace) => workspace.id === workspaceId
  );
  const isPersonal = !!workspaceId && workspaceId === data?.myTeam?.id;

  const { tab } = useParams<{
    tab?: string;
  }>();
  const currentTab = useMemo(() => tab ?? "projects", [tab]);

  const topTabs = useMemo(
    () =>
      topTabItems
        .filter(
          (tab) => !((isPersonal || config()?.saasMode) && tab.id === "members")
        )
        .map((tab) => ({
          ...tab,
          path:
            tab.path ||
            `/dashboard/${workspaceId}/${tab.id === "project" ? "" : tab.id}`
        })),
    [topTabItems, isPersonal, workspaceId]
  );

  const bottomTabs = useMemo(() => bottomTabsItems, [bottomTabsItems]);

  useEffect(() => {
    if (workspace?.id && workspace.id !== currentWorkspace?.id) {
      setCurrentWorkspace({
        ...workspace,
        personal: isPersonal,
        members: workspace.members ?? []
      });
    }
  }, [currentWorkspace, workspace, setCurrentWorkspace, isPersonal]);

  const handleWorkspaceChange = useCallback(
    (workspaceId?: string) => {
      if (workspace) {
        setCurrentWorkspace(workspace);
        navigate(`/dashboard/${workspaceId}`);
      }
    },
    [workspace, setCurrentWorkspace, navigate]
  );

  return {
    workspaces,
    currentWorkspace,
    isPersonal,
    topTabs,
    bottomTabs,
    currentTab,
    onSignOut: logout,
    handleWorkspaceChange
  };
};
