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

  const workspaceManagementMenu: PopupMenuItem[] = useMemo(
    () =>
      workspaceId && !config()?.disableWorkspaceManagement
        ? [
            {
              id: "workspaceSettings",
              title: t("Workspace Settings"),
              icon: "setting",
              onClick: () => navigate(`/settings/workspaces/${workspaceId}`)
            },
            {
              id: "addWorkspace",
              title: t("New Workspace"),
              icon: "newWorkspace",
              hasBorderBottom: true,
              onClick: () => {
                setAddWorkspaceModal(true);
              }
            },
            {
              id: "accountSettings",
              title: t("Account Settings"),
              icon: "user",
              onClick: () => navigate("/settings/account")
            }
          ]
        : [],
    [workspaceId, t, navigate, setAddWorkspaceModal]
  );

  return {
    workspaceManagementMenu
  };
};
