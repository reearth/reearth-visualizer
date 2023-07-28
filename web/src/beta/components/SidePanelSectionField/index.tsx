import { useState, ReactNode } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import Icon from "../Icon";
import Text from "../Text";

const SidePanelSectionField: React.FC<{
  title: string;
  children?: ReactNode;
}> = ({ title, children }) => {
  const theme = useTheme();
  const [opened, setOpened] = useState(false);

  return (
    <Field>
      <Header onClick={() => setOpened(!opened)}>
        <Text size="body" color={theme.general.content.strong}>
          {title}
        </Text>
        <ArrowIcon
          icon="arrowToggle"
          size={12}
          color={theme.general.content.main}
          opened={opened}
        />
      </Header>
      {opened && children}
    </Field>
  );
};

const Field = styled.div`
  background: ${({ theme }) => theme.general.bg.main};
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

const ArrowIcon = styled(Icon)<{ opened: boolean }>`
  transform: rotate(${props => (props.opened ? 90 : 180)}deg);
  transition: all 0.2s;
`;

export default SidePanelSectionField;
