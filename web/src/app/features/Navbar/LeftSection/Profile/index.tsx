import useWorkspaceManagementMenu from "@reearth/app/hooks/useWorkspaceManagementMenu";
import {
  Icon,
  PopupMenu,
  PopupMenuItem,
  Typography
} from "@reearth/app/lib/reearth-ui";
import { isValidUrl } from "@reearth/app/utils/url";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { useCallback, useMemo } from "react";

import { Workspace } from "../../types";

export type Props = {
  workspaces?: Workspace[];
  currentWorkspace?: Workspace;
  onSignOut: () => void;
  onWorkspaceChange?: (workspaceId: string) => void;
  openModal?: () => void;
};

const HeaderProfile: React.FC<Props> = ({
  currentWorkspace,
  workspaces = [],
  onSignOut,
  onWorkspaceChange
}) => {
  const t = useT();

  const handleWorkspaceChange = useCallback(
    (t: string) => {
      onWorkspaceChange?.(t);
    },
    [onWorkspaceChange]
  );

  const { workspaceManagementMenu } = useWorkspaceManagementMenu({
    workspaceId: currentWorkspace?.id,
    workspaceAlias: currentWorkspace?.alias
  });

  const popupMenu: PopupMenuItem[] = useMemo(
    () => [
      {
        icon: "arrowLeftRight",
        id: "switchWorkspace",
        subItem: workspaces.map((w) => {
          return {
            customSubMenuLabel: w.personal
              ? t("Personal")
              : t("Team Workspace"),
            customSubMenuOrder: w.personal ? 0 : 1,
            id: w.id as string,
            title: w.name ?? t("Unknown"),
            hasCustomSubMenu: true,
            personal: w.personal,
            selected: currentWorkspace?.id === w.id,
            customIcon: (
              <AvatarOnMenu data-testid="nav-workspace-avatar">
                {isValidUrl(w.photoURL) && w.photoURL ? (
                  <AvatarImage src={w.photoURL} alt="Avatar" />
                ) : (
                  <Typography
                    size="footnote"
                    data-testid="nav-workspace-avatar-initial"
                  >
                    {w.name?.charAt(0)}
                  </Typography>
                )}
              </AvatarOnMenu>
            ),
            onClick: () => w.id && handleWorkspaceChange(w.id)
          };
        }),
        title: t("Switch workspace")
      },
      ...workspaceManagementMenu,
      {
        icon: "exit",
        id: "logOut",
        onClick: onSignOut,
        title: t("Log out")
      }
    ],
    [
      currentWorkspace?.id,
      handleWorkspaceChange,
      onSignOut,
      t,
      workspaces,
      workspaceManagementMenu
    ]
  );

  const theme = useTheme();

  return (
    <PopupMenu
      label={
        <LabelWrapper>
          <AvatarOnMenu data-testid="nav-avatar">
            {isValidUrl(currentWorkspace?.photoURL) &&
            currentWorkspace?.photoURL ? (
              <AvatarImage src={currentWorkspace.photoURL} alt="Avatar" />
            ) : (
              <Typography size="body" data-testid="nav-avatar-initial">
                {currentWorkspace?.name?.charAt(0)}
              </Typography>
            )}
          </AvatarOnMenu>
          <>
            <Label>{currentWorkspace?.name}</Label>
            <Icon color={theme.content.weak} icon={"caretDown"} size="small" />
          </>
        </LabelWrapper>
      }
      menu={popupMenu}
    />
  );
};

export default HeaderProfile;

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

const LabelWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderRadius: "4px",
  flex: 1,
  alignItems: "center",
  "&:hover": {
    background: theme.bg[2],
    p: {
      color: theme.content.main
    }
  }
}));

const Label = styled("p")(({ theme }) => ({
  padding: "0px 4px 0px 0px",
  fontSize: theme.fonts.sizes.body,
  flex: 1,
  color: theme.content.weak,
  fontWeight: "bold"
}));
