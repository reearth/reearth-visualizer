import {
  Icon,
  PopupMenu,
  PopupMenuItem,
  Typography,
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { ProjectType } from "@reearth/types";
import { FC } from "react";

import { Workspace } from "../type";

export type Project = {
  id?: string;
  name?: string;
  projectType?: ProjectType;
};

type ProfileProp = {
  currentUser?: string;
  currentProject?: Project;
  currentWorkspace?: Workspace;
  isPersonal?: boolean;
  workspaces?: Workspace[];
  onSignOut?: () => void;
  onWorkspaceChange?: (workspaceId?: string) => void;
};

export const Profile: FC<ProfileProp> = ({
  currentUser,
  isPersonal,
  workspaces,
  currentWorkspace,
  onWorkspaceChange,
  onSignOut,
}) => {
  const t = useT();
  const theme = useTheme();

  const popupMenu: PopupMenuItem[] = [
    {
      id: "workspace",
      title: t("Switch WorkSpace"),
      icon: "arrowLeftRight",
      subItem: workspaces?.map((w) => {
        return {
          customSubMenuLabel: w.personal ? t("Personal") : t("Team Workspace"),
          customSubMenuOrder: w.personal ? 0 : 1,
          id: w.id || "",
          title: w.name,
          hasCustomSubMenu: true,
          personal: w.personal,
          selected: currentWorkspace?.id === w.id,
          onClick: () => onWorkspaceChange?.(w.id),
        };
      }),
    },
    {
      id: "signOut",
      title: t("Log Out"),
      icon: "exit",
      onClick: onSignOut,
    },
  ];

  return (
    <ProfileWrapper>
      {isPersonal && (
        <Avatar>
          <Typography size="body">
            {currentUser?.charAt(0).toUpperCase()}
          </Typography>
        </Avatar>
      )}
      <Typography size="body" weight="bold">
        {currentUser}
      </Typography>
      <div>
        <PopupMenu
          label={
            <Icon color={theme.content.weak} icon="caretDown" size="small" />
          }
          menu={popupMenu}
        />
      </div>
    </ProfileWrapper>
  );
};

const ProfileWrapper = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.small}px`,
  display: "flex",
  gap: theme.spacing.small,
  alignItems: "center",
}));

const Avatar = styled("div")(({ theme }) => ({
  width: "25px",
  height: "25px",
  borderRadius: "50%",
  background: theme.bg[2],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
