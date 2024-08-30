import { styled, useTheme } from "@reearth/services/theme";
import { useState, ReactNode, useEffect } from "react";

import Icon from "../Icon";
import Text from "../Text";

const SidePanelSectionField: React.FC<{
  className?: string;
  title?: string;
  startCollapsed?: boolean;
  gap?: number;
  children?: ReactNode;
  storageKey?: string;
  border?: string;
}> = ({
  className,
  title,
  startCollapsed,
  gap,
  children,
  storageKey,
  border
}) => {
  const theme = useTheme();
  const [opened, setOpened] = useState<boolean>(() => {
    const storedValue = localStorage.getItem(storageKey || "");
    return storedValue ? JSON.parse(storedValue) : !startCollapsed;
  });

  useEffect(() => {
    localStorage.setItem(storageKey || "", JSON.stringify(opened));
  }, [opened, storageKey]);

  return (
    <Field className={className}>
      {title && (
        <Header onClick={() => setOpened(!opened)}>
          <Text size="body" color={theme.content.main}>
            {title}
          </Text>
          <ArrowIcon
            icon="arrowToggle"
            size={12}
            color={theme.content.main}
            opened={opened}
          />
        </Header>
      )}

      {opened && children && (
        <Content gap={gap} border={border}>
          {children}
        </Content>
      )}
    </Field>
  );
};

const Field = styled.div`
  background: ${({ theme }) => theme.bg[1]};
  border-radius: 4px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  cursor: pointer;
  height: 38px;
`;

const ArrowIcon = styled(Icon)<{ opened?: boolean }>`
  transform: rotate(${(props) => (props.opened ? 90 : 180)}deg);
  transition: all 0.2s;
`;

const Content = styled.div<{ gap?: number; border?: string }>`
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) => (gap ?? 16) + "px"} 16px;
  border-top: ${({ border, theme }) =>
    border ? `1px solid  ${theme.outline.weak}` : "none"};
`;

export default SidePanelSectionField;
