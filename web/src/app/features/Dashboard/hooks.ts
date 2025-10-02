import { useMe } from "@reearth/services/api/user";
import { useAuth } from "@reearth/services/auth";
import { appFeature } from "@reearth/services/config/appFeatureConfig";
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
  const { me: data } = useMe();
  const { logout } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useWorkspace();

  const workspaces = (data?.workspaces as Workspace[]) ?? [];
  const workspace = workspaces.find(
    (workspace) => workspace.id === workspaceId
  );
  const isPersonal = !!workspaceId && workspaceId === data?.myWorkspace?.id;
  const userPhotoUrl = data?.metadata?.photoURL ?? undefined;

  const { tab } = useParams<{
    tab?: string;
  }>();
  const currentTab = useMemo(() => tab ?? "projects", [tab]);

  const { membersManagementOnDashboard } = appFeature();

  const topTabs = useMemo(
    () =>
      topTabItems
        .filter(
          (tab) =>
            !(
              (isPersonal || !membersManagementOnDashboard) &&
              tab.id === "members"
            )
        )
        .map((tab) => ({
          ...tab,
          path:
            tab.path ||
            `/dashboard/${workspaceId}/${tab.id === "project" ? "" : tab.id}`
        })),
    [topTabItems, isPersonal, workspaceId, membersManagementOnDashboard]
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
    userPhotoUrl,
    topTabs,
    bottomTabs,
    currentTab,
    onSignOut: logout,
    handleWorkspaceChange
  };
};
