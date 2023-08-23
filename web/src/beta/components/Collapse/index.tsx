import { useState, ReactNode, useCallback } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import Icon from "../Icon";
import Text from "../Text";

type StyleType = "settings";

const Collapse: React.FC<{
  title?: string;
  alwaysOpen?: boolean;
  type?: StyleType;
  children?: ReactNode;
}> = ({ title, alwaysOpen, type, children }) => {
  const theme = useTheme();
  const [opened, setOpened] = useState(true);
  const handleOpen = useCallback(() => {
    if (!alwaysOpen) {
      setOpened(!opened);
    }
  }, [alwaysOpen, opened]);

  return (
    <Field>
      {title && (
        <Header type={type} onClick={handleOpen} clickable={!alwaysOpen}>
          <Text size="body" color={theme.content.main}>
            {title}
          </Text>
          {!alwaysOpen && (
            <ArrowIcon icon="arrowToggle" size={12} color={theme.content.main} opened={opened} />
          )}
        </Header>
      )}
      {opened && children && <Content type={type}>{children}</Content>}
    </Field>
  );
};

const Field = styled.div`
  background: ${({ theme }) => theme.bg[1]};
`;

const Header = styled.div<{ clickable?: boolean; type?: StyleType }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${({ clickable }) => (clickable ? "pointer" : "cursor")};
  ${({ type }) =>
    type === "settings"
      ? `
        padding: 12px; 
        line-height: 22px;`
      : `
        padding: 8px;
      `}
`;

const ArrowIcon = styled(Icon)<{ opened: boolean }>`
  transform: rotate(${props => (props.opened ? 90 : 180)}deg);
  transition: all 0.2s;
`;

const Content = styled.div<{ type?: StyleType }>`
  ${({ type }) => (type === "settings" ? "padding: 20px 24px" : "")}
`;

export default Collapse;
