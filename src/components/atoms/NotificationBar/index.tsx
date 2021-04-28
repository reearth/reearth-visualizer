import React, { useState, useEffect } from "react";

// Components
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";

// Theme
import { styled, useTheme } from "@reearth/theme";

export type Type = "error" | "warning" | "info";

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
        color={theme.main.strongText}
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
  background-color: ${props =>
    props.type === "error"
      ? props.theme.main.alert
      : props.type === "warning"
      ? props.theme.main.warning
      : props.theme.main.highlighted};
  color: ${props => props.theme.main.strongText};
  position: absolute;
  top: 0;
  z-index: ${props => props.theme.zIndexes.notificationBar};
`;

const CloseBtn = styled(Icon)`
  padding: 10px;
  cursor: pointer;
`;

export default NotificationBar;
