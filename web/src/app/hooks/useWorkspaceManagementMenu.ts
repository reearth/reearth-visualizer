import {
  appFeature,
  generateExternalUrl
} from "@reearth/services/config/appFeatureConfig";
import { useT } from "@reearth/services/i18n/hooks";
import { useMemo } from "react";
import { useNavigate } from "react-router";

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

  const workspaceManagementMenu: PopupMenuItem[] = useMemo(() => {
    const {
      workspaceManagement,
      externalWorkspaceManagementUrl,
      membersManagementOnDashboard,
      externalMembersManagementUrl
    } = appFeature();

    const menu: PopupMenuItem[] = [];

    if (workspaceManagement || externalWorkspaceManagementUrl) {
      menu.push({
        id: "workspaceSettings",
        dataTestid: "workspace-settings",
        title: t("Workspace settings"),
        icon: "arrowExternalLink",
        iconPosition: "right",
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

    if (membersManagementOnDashboard || externalMembersManagementUrl) {
      menu.push({
        id: "membersSettings",
        dataTestid: "members-settings",
        title: t("Members"),
        icon: "arrowExternalLink",
        iconPosition: "right",
        onClick: () =>
          externalMembersManagementUrl
            ? window.open(
                generateExternalUrl({
                  url: externalMembersManagementUrl,
                  workspaceAlias
                }),
                "_blank"
              )
            : navigate(`/settings/workspaces/${workspaceId}`)
      });
    }

    return menu;
  }, [workspaceId, t, navigate, workspaceAlias]);

  return {
    workspaceManagementMenu
  };
};
