import { useT } from "@reearth/services/i18n";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { PopupMenuItem } from "../lib/reearth-ui";

export default ({ workspaceId }: { workspaceId?: string }) => {
  const navigate = useNavigate();
  const t = useT();

  const workspaceManagementMenu: PopupMenuItem[] = useMemo(
    () =>
      workspaceId
        ? [
            {
              id: "workspaceSettings",
              title: t("Workspace Settings"),
              icon: "setting",
              hasBorderBottom: true,
              onClick: () => navigate(`/settings/workspaces/${workspaceId}`)
            },
            {
              id: "accountSettings",
              title: t("Account Settings"),
              icon: "user",
              onClick: () => navigate("/settings/account")
            }
          ]
        : [],
    [workspaceId, navigate, t]
  );

  return {
    workspaceManagementMenu
  };
};
