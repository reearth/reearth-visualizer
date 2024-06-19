import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useMeFetcher } from "@reearth/services/api";
import { useAuth } from "@reearth/services/auth";
import { useWorkspace } from "@reearth/services/state";

import { TabItems } from ".";

type Props = {
  tabsItem: Omit<TabItems[], "active">;
  workspaceId?: string;
};

export default ({ workspaceId, tabsItem }: Props) => {
  const navigate = useNavigate();
  const { useMeQuery } = useMeFetcher();
  const { me: data } = useMeQuery();
  const { logout } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();

  const workspaces = data?.teams;
  const workspace = workspaces?.find(workspace => workspace.id === workspaceId);
  const isPersonal = !!workspaceId && workspaceId === data?.myTeam?.id;

  const tabs = useMemo(
    () =>
      tabsItem
        .filter(tab => !(isPersonal && tab.id === "members"))
        .map(tab => ({
          ...tab,
          path: tab.path || `/dashboard/${workspaceId}/${tab.id === "project" ? "" : tab.id}`,
        })),
    [tabsItem, isPersonal, workspaceId],
  );

  const topTabs = useMemo(
    () => (isPersonal ? tabs.slice(0, 3) : tabs.slice(0, 4)),
    [isPersonal, tabs],
  );

  const bottomTabs = useMemo(
    () => (isPersonal ? tabs.slice(3) : tabs.slice(4)),
    [isPersonal, tabs],
  );

  useEffect(() => {
    if (workspace?.id && workspace.id !== currentWorkspace?.id) {
      setCurrentWorkspace({
        personal: isPersonal,
        ...workspace,
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
    [workspace, setCurrentWorkspace, navigate],
  );

  return {
    workspaces,
    currentWorkspace,
    isPersonal,
    topTabs,
    bottomTabs,
    onSignOut: logout,
    handleWorkspaceChange,
  };
};
