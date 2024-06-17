import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useMeFetcher } from "@reearth/services/api";
import { useAuth } from "@reearth/services/auth";
import { useWorkspace } from "@reearth/services/state";

import { TabMenu } from ".";

type Props = {
  items: Omit<TabMenu[], "active">;
  workspaceId?: string;
};

export default ({ workspaceId, items }: Props) => {
  const navigate = useNavigate();
  const { useMeQuery } = useMeFetcher();
  const { me: data } = useMeQuery();
  const { logout } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();

  const workspaces = data?.teams;
  const workspace = workspaces?.find(workspace => workspace.id === workspaceId);
  const isPersonal = !!workspaceId && workspaceId === data?.myTeam?.id;

  const { tab } = useParams<{
    tab?: string;
  }>();

  const currentTab = useMemo(() => tab ?? "project", [tab]);

  const tabs = useMemo(
    () =>
      items
        .filter(tab => !(isPersonal && tab.id === "members"))
        .map(tab => ({
          ...tab,
          path: tab.path || `/dashboard/${workspaceId}/${tab.id === "project" ? "" : tab.id}`,
        })),
    [items, isPersonal, workspaceId],
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
    currentTab,
    topTabs,
    bottomTabs,
    onSignOut: logout,
    handleWorkspaceChange,
  };
};
