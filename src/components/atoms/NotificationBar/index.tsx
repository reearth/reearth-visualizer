import React, { useState, useEffect } from "react";

import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

export type Type = "error" | "warning" | "info" | "success";

interface NotificationBarProps {
  text?: string;
  hidden?: boolean;
  type?: Type;
  onClose?: () => void;
}

const NotificationBar: React.FC<NotificationBarProps> = ({
  text,
  hidden,
  type,
  children,
  onClose,
}) => {
  const [visibility, changeVisibility] = useState(!hidden);
  useEffect(() => {
    changeVisibility(!hidden);
  }, [hidden, text]);
  const theme = useTheme();

  return visibility && (text || children) && type ? (
    <StyledNotificationBar type={type}>
      <Text
        size="m"
        color={theme.notification.text}
        weight="bold"
        otherProperties={{ padding: "10px" }}>
        {text || children}
      </Text>
      <CloseBtn
        icon="cancel"
        size={20}
        onClick={() => {
          changeVisibility(false);
          onClose?.();
        }}
      />
    </StyledNotificationBar>
  ) : null;
};

const StyledNotificationBar = styled.div<{
  type?: Type;
}>`
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ type, theme }) =>
    type === "error"
      ? theme.notification.errorBg
      : type === "warning"
      ? theme.notification.warningBg
      : type === "success"
      ? theme.notification.successBg
      : theme.notification.infoBg};
  color: ${({ theme }) => theme.notification.text};
  position: absolute;
  top: 0;
  z-index: ${props => props.theme.zIndexes.notificationBar};
`;

const CloseBtn = styled(Icon)`
  padding: 10px;
  cursor: pointer;
`;

export default NotificationBar;
