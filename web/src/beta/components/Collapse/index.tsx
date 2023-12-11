import { useState, ReactNode, useCallback } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import Icon from "../Icon";
import Text from "../Text";

const Collapse: React.FC<{
  title?: string;
  alwaysOpen?: boolean;
  children?: ReactNode;
}> = ({ title, alwaysOpen, children }) => {
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
        <Header onClick={handleOpen} clickable={!alwaysOpen}>
          <Text size="body" color={theme.content.main}>
            {title}
          </Text>
          {!alwaysOpen && (
            <ArrowIcon icon="arrowToggle" size={12} color={theme.content.main} opened={opened} />
          )}
        </Header>
      )}
      {opened && children && <Content>{children}</Content>}
    </Field>
  );
};

const Field = styled.div`
  background: ${({ theme }) => theme.bg[1]};
`;

const Header = styled.div<{ clickable?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: ${({ clickable }) => (clickable ? "pointer" : "cursor")};
  padding: ${({ theme }) => theme.spacing.normal}px;
`;

const ArrowIcon = styled(Icon)<{ opened: boolean }>`
  transform: rotate(${props => (props.opened ? 90 : 180)}deg);
  transition: all 0.2s;
`;

const Content = styled.div`
  padding: ${({ theme }) => `${theme.spacing.largest}px ${theme.spacing.super}px`};
`;

export default Collapse;
