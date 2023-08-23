import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

import useHooks from "./hooks";

export type NotificationType = "error" | "warning" | "info" | "success";
export type Notification = {
  type: NotificationType;
  heading?: string;
  text: string;
};

const NotificationBanner: React.FC = () => {
  const { visible, notification, setModal, resetNotification } = useHooks();
  const theme = useTheme();

  return (
    <StyledNotificationBanner
      aria-hidden={!visible}
      role="banner"
      visible={visible}
      type={notification?.type}>
      <HeadingArea>
        <Text
          size="body"
          color={theme.classic.notification.text}
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
      <Text size="footnote" color={theme.classic.notification.text}>
        {notification?.text}
      </Text>
    </StyledNotificationBanner>
  );
};

export default NotificationBanner;

const StyledNotificationBanner = styled.div<{
  type?: NotificationType;
  visible?: boolean;
}>`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 49px;
  right: 0;
  width: 312px;
  padding: 8px 12px;
  background-color: ${({ type, theme }) =>
    type === "error"
      ? theme.classic.notification.errorBg
      : type === "warning"
      ? theme.classic.notification.warningBg
      : type === "success"
      ? theme.classic.notification.successBg
      : theme.classic.notification.infoBg};
  color: ${({ theme }) => theme.classic.notification.text};
  z-index: ${({ theme, visible }) => (visible ? theme.classic.zIndexes.notificationBar : 0)};
  opacity: ${({ visible }) => (visible ? "1" : "0")};
  transition: all 0.5s;
  pointer-events: ${({ visible }) => (visible ? "auto" : "none")};
`;

const HeadingArea = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const CloseBtn = styled(Icon)`
  cursor: pointer;
`;
