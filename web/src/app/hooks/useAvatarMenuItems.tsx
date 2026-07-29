import { PopupMenuItem, Typography } from "@reearth/app/lib/reearth-ui";
import {
  appFeature,
  generateExternalUrl
} from "@reearth/services/config/appFeatureConfig";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { useMemo } from "react";
import { useNavigate } from "react-router";

export const useAvatarMenuItems = ({
  userName,
  userEmail,
  onSignOut
}: {
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
}): PopupMenuItem[] => {
  const t = useT();
  const theme = useTheme();
  const navigate = useNavigate();

  return useMemo(() => {
    const { accountManagement, externalAccountManagementUrl } = appFeature();

    const menu: PopupMenuItem[] = [
      {
        id: "userInfo",
        dataTestid: "avatar-userInfo",
        hasBorderBottom: true,
        disabled: true,
        tileComponent: (
          <HeaderWrapper>
            <Typography
              weight="bold"
              size="body"
              data-testid="profile-avatar-name"
            >
              {userName}
            </Typography>
            <Typography size="footnote" data-testid="profile-avatar-email">
              {userEmail}
            </Typography>
          </HeaderWrapper>
        )
      }
    ];

    if (accountManagement || externalAccountManagementUrl) {
      menu.push({
        id: "accountSettings",
        title: t("Account Settings"),
        icon: externalAccountManagementUrl ? "arrowExternalLink" : undefined,
        iconPosition: "right",
        dataTestid: "avatar-accountSettings",
        onClick: () =>
          externalAccountManagementUrl
            ? window.open(
                generateExternalUrl({ url: externalAccountManagementUrl }),
                "_blank"
              )
            : navigate("/settings/account")
      });
    }

    menu.push({
      id: "signOut",
      title: t("Log out"),
      icon: "exit",
      color: theme.dangerous.main,
      iconColor: theme.dangerous.main,
      onClick: onSignOut,
      dataTestid: "avatar-signOut"
    });

    return menu;
  }, [t, onSignOut, navigate, theme.dangerous.main, userName, userEmail]);
};

const HeaderWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.micro
}));
