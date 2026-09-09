import { useAvatarMenuItems } from "@reearth/app/hooks/useAvatarMenuItems";
import { PopupMenu, Typography } from "@reearth/app/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useState } from "react";

export const AvatarWrapper: FC<{
  avatarURL?: string;
  userName?: string;
  userEmail?: string;
  onSignOut?: () => void;
}> = ({ avatarURL, userName, userEmail, onSignOut }) => {
  const [failedURL, setFailedURL] = useState<string>();
  const showImage = !!avatarURL && avatarURL !== failedURL;
  const initial = userName?.trim().charAt(0).toUpperCase() || "?";
  const popupMenu = useAvatarMenuItems({ userName, userEmail, onSignOut });

  return (
    <PopupMenu
      label={
        <Avatar data-testid="profile-avatar">
          {showImage ? (
            <AvatarImage
              src={avatarURL}
              alt="Avatar"
              onError={() => setFailedURL(avatarURL)}
            />
          ) : (
            <Typography size="body" data-testid="profile-avatar-initial">
              {initial}
            </Typography>
          )}
        </Avatar>
      }
      menu={popupMenu}
      dataTestid="avatar-popup-menu"
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

