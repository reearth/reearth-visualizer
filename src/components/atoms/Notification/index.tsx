import React from "react";

import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled, metrics, useTheme } from "@reearth/theme";

export type NotificationType = "error" | "warning" | "info" | "success";
export type Notification = {
  type: NotificationType;
  heading?: string;
  text: string;
};

export type Props = {
  visible?: boolean;
  setModal?: (show: boolean) => void;
  notification?: Notification;
  resetNotification?: () => void;
};

const NotificationBanner: React.FC<Props> = ({
  visible,
  setModal,
  notification,
  resetNotification,
}) => {
  const theme = useTheme();

  return (
    <StyledNotificationBanner
      aria-hidden={!visible}
      role="banner"
      visible={visible}
      type={notification?.type}
      direction="column">
      <HeadingArea justify="space-between">
        <Text
          size="m"
          color={theme.notification.text}
          weight="bold"
          otherProperties={{ padding: "0 0 8px 0" }}>
          {notification?.heading}
        </Text>
        <CloseBtn
          role="button"
          icon="cancel"
          size={20}
          onClick={() => {
            setModal?.(false);
            resetNotification?.();
          }}
        />
      </HeadingArea>
      <Text size="s" color={theme.notification.text}>
        {notification?.text}
      </Text>
    </StyledNotificationBanner>
  );
};

const StyledNotificationBanner = styled(Flex)<{
  type?: NotificationType;
  visible?: boolean;
}>`
  position: absolute;
  top: ${metrics.headerHeight}px;
  right: 0;
  width: 312px;
  padding: 8px 12px;
  background-color: ${({ type, theme }) =>
    type === "error"
      ? theme.notification.errorBg
      : type === "warning"
      ? theme.notification.warningBg
      : type === "success"
      ? theme.notification.successBg
      : theme.notification.infoBg};
  color: ${({ theme }) => theme.notification.text};
  z-index: ${({ theme, visible }) => (visible ? theme.zIndexes.notificationBar : 0)};
  opacity: ${({ visible }) => (visible ? "1" : "0")};
  transition: all 0.5s;
  pointer-events: ${({ visible }) => (visible ? "auto" : "none")};
`;

const HeadingArea = styled(Flex)`
  width: 100%;
`;

const CloseBtn = styled(Icon)`
  cursor: pointer;
`;

export default NotificationBanner;
