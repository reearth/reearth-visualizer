import { IconButton, Typography } from "@reearth/app/lib/reearth-ui";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

import useHooks from "./hooks";

export type NotificationType = "error" | "warning" | "info" | "success";
export type Notification = {
  type: NotificationType;
  heading?: string;
  text: string;
};

const NotificationBanner: FC = () => {
  const { isHovered, visible, notification, setModal, setIsHovered } =
    useHooks();
  const theme = useTheme();

  return (
    <StyledNotificationBanner
      aria-hidden={!visible}
      role="banner"
      visible={visible}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      type={notification?.type}
    >
      <HeadingArea>
        <Typography size="body" color={theme.content.strong} weight="bold">
          {notification?.heading}
        </Typography>
        <IconWrapper show={isHovered}>
          <IconButton
            icon="close"
            size="normal"
            appearance="simple"
            onClick={() => {
              setModal?.(false);
            }}
          />
        </IconWrapper>
      </HeadingArea>
      {notification?.text && (
        <Typography
          size="footnote"
          color={theme.content.strong}
          otherProperties={{ padding: "8px 0 0 0" }}
        >
          {notification?.text}
        </Typography>
      )}
    </StyledNotificationBanner>
  );
};

export default NotificationBanner;

const StyledNotificationBanner = styled("div")<{
  type?: NotificationType;
  visible?: boolean;
}>(({ visible, type, theme }) => ({
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  top: 30,
  left: 0,
  right: 0,
  margin: "auto",
  width: 312,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  borderRadius: theme.radius.normal,
  boxShadow:
    "rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px",
  backgroundColor:
    type === "error"
      ? theme.dangerous.main
      : type === "warning"
        ? theme.warning.main
        : type === "success"
          ? theme.select.strong
          : theme.secondary.main,
  color: theme.content.main,
  zIndex: visible ? theme.zIndexes.editor.notificationBar : 0,
  opacity: visible ? "1" : "0",
  pointerEvents: visible ? "auto" : "none",
  transition: "all 0.5s",
  "&:hover": {
    padding: `${theme.spacing.small}px ${theme.spacing.normal}px`
  }
}));

const HeadingArea = styled("div")(() => ({
  display: "flex",
  justifyContent: "space-between",
  width: "100%"
}));

const IconWrapper = styled("div")<{ show: boolean }>(({ show }) => ({
  opacity: show ? "100%" : "0"
}));
