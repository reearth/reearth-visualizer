import useWorkspaceManagementMenu from "@reearth/beta/hooks/useWorkspaceManagementMenu";
import { PopupMenu, PopupMenuItem } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Workspace } from "../../types";

export type Props = {
  workspaces?: Workspace[];
  currentWorkspace?: Workspace;
  onSignOut: () => void;
  onWorkspaceChange?: (workspaceId: string) => void;
  openModal?: () => void;
};

const HeaderProfile: React.FC<Props> = ({
  currentWorkspace,
  workspaces = [],
  onSignOut,
  onWorkspaceChange
}) => {
  const t = useT();

  const handleWorkspaceChange = useCallback(
    (t: string) => {
      onWorkspaceChange?.(t);
    },
    [onWorkspaceChange]
  );

  const navigate = useNavigate();
  const handleAssetManager = useCallback(() => {
    if (currentWorkspace?.id) {
      navigate(`/dashboard/${currentWorkspace.id}/asset`);
    }
  }, [currentWorkspace?.id, navigate]);

  const { workspaceManagementMenu } = useWorkspaceManagementMenu({
    workspaceId: currentWorkspace?.id
  });

  const popupMenu: PopupMenuItem[] = useMemo(
    () => [
      {
        icon: "arrowLeftRight",
        id: "switchWorkspace",
        subItem: workspaces.map((w) => {
          return {
            customSubMenuLabel: w.personal
              ? t("Personal")
              : t("Team Workspace"),
            customSubMenuOrder: w.personal ? 0 : 1,
            id: w.id as string,
            title: w.name ?? t("Unknown"),
            hasCustomSubMenu: true,
            personal: w.personal,
            selected: currentWorkspace?.id === w.id,
            onClick: () => w.id && handleWorkspaceChange(w.id)
          };
        }),
        title: t("Switch workspace")
      },
      ...workspaceManagementMenu,
      {
        icon: "exit",
        id: "logOut",
        hasBorderBottom: true,
        onClick: onSignOut,
        title: t("Log out")
      },
      {
        icon: "file",
        id: "assetManagement",
        onClick: handleAssetManager,
        title: t("Asset management")
      }
    ],
    [
      currentWorkspace?.id,
      handleAssetManager,
      handleWorkspaceChange,
      onSignOut,
      t,
      workspaces,
      workspaceManagementMenu
    ]
  );

  return <PopupMenu label={currentWorkspace?.name} menu={popupMenu} />;
};

export default HeaderProfile;
