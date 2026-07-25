import {
  PopupMenu,
  PopupMenuItem,
  Typography
} from "@reearth/app/lib/reearth-ui";
import {
  appFeature,
  generateExternalUrl
} from "@reearth/services/config/appFeatureConfig";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useMemo, useState } from "react";
import { useNavigate } from "react-router";

export const AvatarWrapper: FC<{
  avatarURL?: string;
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
}> = ({ avatarURL, userName, userEmail, onSignOut }) => {
  const [showAvatar, setShowAvatar] = useState(!!avatarURL);
  const t = useT();
  const theme = useTheme();
  const navigate = useNavigate();

  const popupMenu: PopupMenuItem[] = useMemo(() => {
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

  return (
    <PopupMenu
      label={
        <Avatar data-testid="profile-avatar">
          {avatarURL && showAvatar ? (
            <AvatarImage
              src={avatarURL}
              alt="Avatar"
              onError={() => setShowAvatar(false)}
            />
          ) : (
            <Typography size="body" data-testid="profile-avatar-initial">
              {userName?.charAt(0).toUpperCase()}
            </Typography>
          )}
        </Avatar>
      }
      menu={popupMenu}
      dataTestid="avatar-popupMenu"
    />
  );
};

export default AvatarWrapper;

const Avatar = styled("div")(({ theme }) => ({
  width: "25px",
  height: "25px",
  borderRadius: "50%",
  background: theme.bg[2],
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  flexShrink: 0,
  overflow: css.overflow.hidden,
  cursor: css.cursor.pointer
}));

const AvatarImage = styled("img")({
  position: css.position.relative,
  width: "100%",
  height: "100%",
  objectFit: css.objectFit.cover
});

const HeaderWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.micro,
}));
