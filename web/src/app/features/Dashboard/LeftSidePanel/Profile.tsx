import useWorkspaceManagementMenu from "@reearth/app/hooks/useWorkspaceManagementMenu";
import {
  Icon,
  PopupMenu,
  PopupMenuItem,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { isValidUrl } from "@reearth/app/utils/url";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { ProjectType } from "@reearth/types";
import { FC, useMemo, useState } from "react";

import { Workspace } from "../type";

export type Project = {
  id?: string;
  name?: string;
  projectType?: ProjectType;
};

type ProfileProps = {
  currentUser?: string;
  currentProject?: Project;
  currentWorkspace?: Workspace;
  avatarURL?: string;
  workspaces?: Workspace[];
  onSignOut?: () => void;
  onWorkspaceChange?: (workspaceId?: string) => void;
};

const Profile: FC<ProfileProps> = ({
  currentUser,
  avatarURL,
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
            customIcon: (
              <AvatarOnMenu data-testid="workspace-avatar">
                {isValidUrl(w.photoURL) && w.photoURL ? (
                  <AvatarImage src={w.photoURL} alt="Avatar" />
                ) : (
                  <Typography
                    size="footnote"
                    data-testid="workspace-avatar-initial"
                  >
                    {w.name?.charAt(0)}
                  </Typography>
                )}
              </AvatarOnMenu>
            ),
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

  const [showAvatar, setShowAvatar] = useState(!!avatarURL);

  return (
    <Wrapper data-testid="profile-wrapper">
      <ProfileWrapper data-testid="profile-profileWrapper">
        <Avatar data-testid="profile-avatar">
          {avatarURL && showAvatar ? (
            <AvatarImage
              src={avatarURL}
              alt="Avatar"
              onError={() => setShowAvatar(false)}
            />
          ) : (
            <Typography size="body" data-testid="profile-avatar-initial">
              {currentUser?.charAt(0)}
            </Typography>
          )}
        </Avatar>
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

export default Profile;

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
  flexShrink: 0,
  overflow: "hidden"
}));

const AvatarOnMenu = styled("div")(({ theme }) => ({
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  background: theme.relative.light,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  overflow: "hidden"
}));

const AvatarImage = styled("img")({
  position: "relative",
  width: "100%",
  height: "100%",
  objectFit: "cover"
});

const TitleWrapper = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.bold,
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-all"
}));

const PopupWrapper = styled("div")(() => ({}));
