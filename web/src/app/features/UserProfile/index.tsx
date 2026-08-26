import { Workspace } from "@reearth/app/features/Dashboard/type";
import useWorkspaceManagementMenu from "@reearth/app/hooks/useWorkspaceManagementMenu";
import {
  Icon,
  PopupMenu,
  PopupMenuItem,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { isValidUrl } from "@reearth/app/utils/url";
import {
  appFeature,
  generateExternalUrl
} from "@reearth/services/config/appFeatureConfig";
import { useT } from "@reearth/services/i18n/hooks";
import { useAddWorkspaceModal } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { ProjectType } from "@reearth/types";
import { FC, useMemo } from "react";

export type Project = {
  id?: string;
  name?: string;
  projectType?: ProjectType;
};

type ProfileProps = {
  currentUser?: string;
  currentProject?: Project;
  currentWorkspace?: Workspace;
  workspaces?: Workspace[];
  onWorkspaceChange?: (workspaceId: string) => void;
  "data-testid"?: string;
};

const Profile: FC<ProfileProps> = ({
  currentUser,
  workspaces,
  currentWorkspace,
  "data-testid": dataTestid,
  onWorkspaceChange
}) => {
  const t = useT();
  const theme = useTheme();
  const [, setAddWorkspaceModal] = useAddWorkspaceModal();

  const { workspaceManagementMenu } = useWorkspaceManagementMenu({
    workspaceId: currentWorkspace?.id,
    workspaceAlias: currentWorkspace?.alias
  });

  const submenuItems: PopupMenuItem[] = useMemo(() => {
    const { workspaceCreation, externalWorkspaceCreationUrl } = appFeature();

    const toItem = (w: Workspace): PopupMenuItem => ({
      id: w.id || "",
      title: w.name,
      personal: w.personal,
      selected: currentWorkspace?.id === w.id,
      customIcon: (
        <AvatarOnMenu isPersonal={w.personal} data-testid="workspace-avatar">
          {isValidUrl(w.photoURL) && w.photoURL ? (
            <AvatarImage src={w.photoURL} alt="Avatar" />
          ) : (
            <Typography size="footnote" data-testid="workspace-avatar-initial">
              {w.name?.charAt(0).toUpperCase()}
            </Typography>
          )}
        </AvatarOnMenu>
      ),
      onClick: () => onWorkspaceChange?.(w.id)
    });

    const personalItems =
      workspaces?.filter((w) => w.personal).map(toItem) ?? [];
    const teamItems = workspaces?.filter((w) => !w.personal).map(toItem) ?? [];

    const items: PopupMenuItem[] = [
      { id: "header-personal", isHeader: true, title: t("Personal Account") },
      ...personalItems,
      { id: "header-team", isHeader: true, title: t("Team Workspace") },
      ...teamItems
    ];

    if (workspaceCreation) {
      items.push({
        id: "newWorkspace",
        dataTestid: "profile-newWorkspace",
        hasFooter: true,
        title: t("New workspace"),
        icon: "plus",
        iconColor: theme.primary.main,
        color: theme.primary.main,
        onClick: () =>
          externalWorkspaceCreationUrl
            ? window.open(
                generateExternalUrl({
                  url: externalWorkspaceCreationUrl,
                  workspaceAlias: currentWorkspace?.alias
                }),
                "_blank"
              )
            : setAddWorkspaceModal(true)
      });
    }

    return items;
  }, [
    workspaces,
    t,
    currentWorkspace?.id,
    currentWorkspace?.alias,
    onWorkspaceChange,
    theme.primary.main,
    setAddWorkspaceModal
  ]);

  const popupMenu: PopupMenuItem[] = useMemo(
    () => [
      { id: "header-workspace", isHeader: true, title: t("Workspace") },
      {
        id: "workspace",
        dataTestid: "profile-switchWorkspace",
        hasBorderBottom: true,
        title: currentWorkspace?.name,
        customIcon: (
          <WorkspaceLabel>
            <AvatarOnMenu data-testid="profile-workspace-avatar">
              {isValidUrl(currentWorkspace?.photoURL) &&
              currentWorkspace?.photoURL ? (
                <AvatarImage src={currentWorkspace.photoURL} alt="Avatar" />
              ) : (
                <Typography size="footnote">
                  {currentWorkspace?.name?.charAt(0).toUpperCase()}
                </Typography>
              )}
            </AvatarOnMenu>
          </WorkspaceLabel>
        ),
        subItem: submenuItems
      },
      ...workspaceManagementMenu
    ],
    [
      currentWorkspace?.name,
      currentWorkspace?.photoURL,
      submenuItems,
      t,
      workspaceManagementMenu
    ]
  );

  return (
    <Wrapper data-testid="profile-wrapper">
      <ProfileWrapper data-testid="profile-profileWrapper">
        <TitleWrapper data-testid="profile-titleWrapper">
          {currentUser}
        </TitleWrapper>
        <PopupWrapper data-testid="profile-popupWrapper">
          <PopupMenu
            dataTestid={dataTestid ?? "profile-popupMenu"}
            label={
              <Icon
                color={theme.content.weak}
                icon="caretDown"
                size="small"
                data-testid="profile-caretDownIcon"
              />
            }
            menu={popupMenu}
            width={160}
          />
        </PopupWrapper>
      </ProfileWrapper>
    </Wrapper>
  );
};

export default Profile;

const Wrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing.normal
}));

const ProfileWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.small,
  alignItems: css.alignItems.center
}));

const AvatarOnMenu = styled("div")<{ isPersonal?: boolean }>(
  ({ theme, isPersonal }) => ({
    width: "24px",
    height: "24px",
    borderRadius: isPersonal ? "50%" : theme.spacing.smallest,
    background: theme.relative.light,
    display: css.display.flex,
    alignItems: css.alignItems.center,
    justifyContent: css.justifyContent.center,
    flexShrink: 0,
    overflow: css.overflow.hidden
  })
);

const AvatarImage = styled("img")({
  position: css.position.relative,
  width: "100%",
  height: "100%",
  objectFit: css.objectFit.cover
});

const TitleWrapper = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.bold,
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis,
  wordBreak: css.wordBreak.breakAll,
  paddingRight: theme.spacing.small
}));

const PopupWrapper = styled("div")(() => ({}));

const WorkspaceLabel = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  padding: `${theme.spacing.micro}px 0`,
  gap: theme.spacing.small,
  flex: 1
}));
