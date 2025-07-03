import { config } from "@reearth/services/config";
import { useT } from "@reearth/services/i18n";
import { useAddWorkspaceModal } from "@reearth/services/state";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { PopupMenuItem } from "../lib/reearth-ui";

export default ({ workspaceId }: { workspaceId?: string }) => {
  const navigate = useNavigate();
  const t = useT();
  const [_, setAddWorkspaceModal] = useAddWorkspaceModal();
  const { platformUrl } = config() ?? {};

  const workspaceManagementMenu: PopupMenuItem[] = useMemo(
    () =>
      workspaceId
        ? config()?.saasMode
          ? [
              {
                id: "accountSettings",
                dataTestid: "account-settings",
                title: t("Account settings"),
                icon: "user",
                onClick: () => navigate(`${platformUrl}/settings/profile`)
              }
            ]
          : [
              {
                id: "workspaceSettings",
                dataTestid: "workspace-settings",
                title: t("Workspace settings"),
                icon: "setting",
                onClick: () => navigate(`/settings/workspaces/${workspaceId}`)
              },
              {
                id: "addWorkspace",
                dataTestid: "add-workspace",
                title: t("New workspace"),
                icon: "newWorkspace",
                hasBorderBottom: true,
                onClick: () => {
                  setAddWorkspaceModal(true);
                }
              },
              {
                id: "accountSettings",
                dataTestid: "account-settings",
                title: t("Account settings"),
                icon: "user",
                onClick: () => navigate("/settings/account")
              }
            ]
        : [],
    [workspaceId, t, navigate, setAddWorkspaceModal, platformUrl]
  );

  return {
    workspaceManagementMenu
  };
};
