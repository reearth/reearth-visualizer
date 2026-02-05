import {
  appFeature,
  generateExternalUrl
} from "@reearth/services/config/appFeatureConfig";
import { useT } from "@reearth/services/i18n";
import { useAddWorkspaceModal } from "@reearth/services/state";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { PopupMenuItem } from "../lib/reearth-ui";

export default ({
  workspaceId,
  workspaceAlias
}: {
  workspaceId?: string;
  workspaceAlias?: string;
}) => {
  const navigate = useNavigate();
  const t = useT();
  const [_, setAddWorkspaceModal] = useAddWorkspaceModal();

  const workspaceManagementMenu: PopupMenuItem[] = useMemo(() => {
    const {
      workspaceCreation,
      workspaceManagement,
      externalWorkspaceManagementUrl,
      accountManagement,
      externalAccountManagementUrl
    } = appFeature();

    const menu: PopupMenuItem[] = [];

    if (workspaceManagement || externalWorkspaceManagementUrl) {
      menu.push({
        id: "workspaceSettings",
        dataTestid: "workspace-settings",
        title: t("Workspace settings"),
        icon: "setting",
        onClick: () =>
          externalWorkspaceManagementUrl
            ? window.open(
                generateExternalUrl({
                  url: externalWorkspaceManagementUrl,
                  workspaceAlias
                }),
                "_blank"
              )
            : navigate(`/settings/workspaces/${workspaceId}`)
      });
    }

    if (workspaceCreation) {
      menu.push({
        id: "addWorkspace",
        dataTestid: "add-workspace",
        title: t("New workspace"),
        icon: "newWorkspace",
        hasBorderBottom: true,
        onClick: () => {
          setAddWorkspaceModal(true);
        }
      });
    }

    if (accountManagement || externalAccountManagementUrl) {
      menu.push({
        id: "accountSettings",
        dataTestid: "account-settings",
        title: t("Account settings"),
        icon: "user",
        onClick: () =>
          externalAccountManagementUrl
            ? window.open(externalAccountManagementUrl, "_blank")
            : navigate(`/settings/account`)
      });
    }

    return menu;
  }, [workspaceId, t, navigate, setAddWorkspaceModal, workspaceAlias]);

  return {
    workspaceManagementMenu
  };
};
