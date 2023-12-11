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
  const { isHovered, visible, notification, setModal, setIsHovered } = useHooks();
  const theme = useTheme();

  return (
    <StyledNotificationBanner
      aria-hidden={!visible}
      role="banner"
      visible={visible}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      type={notification?.type}>
      <HeadingArea>
        <Text size="body" color={theme.content.strong} weight="bold">
          {notification?.heading}
        </Text>
        <CloseBtn
          role="button"
          icon="cancel"
          size={20}
          show={isHovered}
          onClick={() => {
            setModal?.(false);
          }}
        />
      </HeadingArea>
      {notification?.text && (
        <Text
          size="footnote"
          color={theme.content.strong}
          otherProperties={{ padding: "8px 0 0 0" }}>
          {notification?.text}
        </Text>
      )}
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
  top: 30px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  width: 312px;
  padding: 4px 8px;
  border-radius: 6px;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
  background-color: ${({ type, theme }) =>
    type === "error"
      ? theme.dangerous.main
      : type === "warning"
      ? theme.warning.main
      : type === "success"
      ? theme.select.strong
      : theme.secondary.main};
  color: ${({ theme }) => theme.content.main};
  z-index: ${({ theme, visible }) => (visible ? theme.zIndexes.editor.notificationBar : 0)};
  opacity: ${({ visible }) => (visible ? "1" : "0")};
  transition: all 0.5s;
  pointer-events: ${({ visible }) => (visible ? "auto" : "none")};

  :hover {
    padding: 8px 12px;
  }
`;

const HeadingArea = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const CloseBtn = styled(Icon)<{ show: boolean }>`
  cursor: pointer;
  transition: all 1s;
  opacity: ${({ show }) => (show ? "100%" : "0")};
`;
