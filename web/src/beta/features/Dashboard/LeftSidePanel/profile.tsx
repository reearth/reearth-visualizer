import useWorkspaceManagementMenu from "@reearth/beta/hooks/useWorkspaceManagementMenu";
import {
  Icon,
  PopupMenu,
  PopupMenuItem,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { ProjectType } from "@reearth/types";
import { FC, useMemo } from "react";

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
  onSignOut
}) => {
  const t = useT();
  const theme = useTheme();

  const { workspaceManagementMenu } = useWorkspaceManagementMenu({
    workspaceId: currentWorkspace?.id
  });

  const popupMenu: PopupMenuItem[] = useMemo(
    () => [
      {
        id: "workspace",
        title: t("Switch Workspace"),
        icon: "arrowLeftRight",
        subItem: workspaces?.map((w) => {
          return {
            customSubMenuLabel: w.personal
              ? t("Personal")
              : t("Team Workspace"),
            customSubMenuOrder: w.personal ? 0 : 1,
            id: w.id || "",
            title: w.name,
            hasCustomSubMenu: true,
            personal: w.personal,
            selected: currentWorkspace?.id === w.id,
            onClick: () => onWorkspaceChange?.(w.id)
          };
        })
      },
      ...workspaceManagementMenu,
      {
        id: "signOut",
        title: t("Log Out"),
        icon: "exit",
        onClick: onSignOut
      }
    ],
    [
      currentWorkspace?.id,
      onSignOut,
      onWorkspaceChange,
      t,
      workspaces,
      workspaceManagementMenu
    ]
  );

  return (
    <Wrapper>
      <ProfileWrapper>
        {isPersonal && (
          <Avatar>
            <Typography size="body">
              {currentUser?.charAt(0).toUpperCase()}
            </Typography>
          </Avatar>
        )}
        <TitleWrapper>{currentUser}</TitleWrapper>
        <PopupWrapper>
          <PopupMenu
            label={
              <Icon color={theme.content.weak} icon="caretDown" size="small" />
            }
            menu={popupMenu}
          />
        </PopupWrapper>
      </ProfileWrapper>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  alignContent: "center",
  paddingLeft: theme.spacing.small,
  paddingRight: theme.spacing.normal,
  paddingTop: theme.spacing.largest,
  paddingBottom: theme.spacing.small,
  justifyContent: "center"
}));

const ProfileWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  alignItems: "center"
}));

const Avatar = styled("div")(({ theme }) => ({
  width: "25px",
  height: "25px",
  borderRadius: "50%",
  background: theme.bg[2],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.bold,
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-all"
}));

const PopupWrapper = styled("div")(() => ({}));
