import {
  appFeature,
  generateExternalUrl
} from "@reearth/services/config/appFeatureConfig";
import { useLang, useT } from "@reearth/services/i18n/hooks";
import { useTheme } from "@reearth/services/theme";
import { useMemo } from "react";
import { useNavigate } from "react-router";

import { PopupMenuItem } from "../lib/reearth-ui";

import { useAvatarMenuItems } from "./useAvatarMenuItems";

export default ({
  workspaceId,
  workspaceAlias,
  userName,
  userEmail,
  onSignOut
}: {
  workspaceId?: string;
  workspaceAlias?: string;
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
}) => {
  const navigate = useNavigate();
  const t = useT();
  const lang = useLang();
  const theme = useTheme();
  const avatarMenuItems = useAvatarMenuItems({
    userName,
    userEmail,
    onSignOut
  });

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

  const accountMenuItems: PopupMenuItem[] = useMemo(
    () => [
      {
        id: "projects",
        dataTestid: "projects",
        title: t("Projects"),
        icon: "grid",
        color: theme.content.main,
        onClick: () => navigate(`/dashboard/${workspaceId}`)
      },
      {
        id: "account",
        title: t("Account"),
        subItem: avatarMenuItems
      },
      {
        id: "documents",
        title: t("Documentation"),
        icon: "arrowExternalLink",
        iconPosition: "right",
        onClick: () =>
          window.open(
            generateExternalUrl({
              url:
                lang === "ja"
                  ? "https://eukarya.notion.site/Visualizer-1a816e0fb16580bda8b2c2699f80399c"
                  : "https://eukarya.notion.site/Visualizer-User-manual-1a816e0fb16580e3a26ac6e35f23a166"
            }),
            "_blank"
          )
      }
    ],
    [t, theme.content.main, avatarMenuItems, lang, navigate, workspaceId]
  );

  return {
    workspaceManagementMenu,
    accountMenuItems
  };
};
