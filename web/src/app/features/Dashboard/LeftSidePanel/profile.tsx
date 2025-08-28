import useWorkspaceManagementMenu from "@reearth/app/hooks/useWorkspaceManagementMenu";
import {
  Icon,
  PopupMenu,
  PopupMenuItem,
  Typography
} from "@reearth/app/lib/reearth-ui";
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
    workspaceId: currentWorkspace?.id,
    workspaceAlias: currentWorkspace?.alias
  });

  const popupMenu: PopupMenuItem[] = useMemo(
    () => [
      {
        id: "workspace",
        title: t("Switch workspace"),
        dataTestid: "profile-switchWorkspace",
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
        dataTestid: "profile-signOut",
        title: t("Log out"),
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
    <Wrapper data-testid="profile-wrapper">
      <ProfileWrapper data-testid="profile-profileWrapper">
        {isPersonal && (
          <Avatar data-testid="profile-avatar">
            <Typography size="body" data-testid="profile-avatar-initial">
              {currentUser?.charAt(0)}
            </Typography>
          </Avatar>
        )}
        <TitleWrapper data-testid="profile-titleWrapper">
          {currentUser}
        </TitleWrapper>
        <PopupWrapper data-testid="profile-popupWrapper">
          <PopupMenu
            data-testid="profile-popupMenu"
            label={
              <Icon
                color={theme.content.weak}
                icon="caretDown"
                size="small"
                data-testid="profile-caretDownIcon"
              />
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
