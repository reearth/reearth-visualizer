import { useState, ReactNode } from "react";

import { styled, useTheme, PublishTheme } from "@reearth/services/theme";

import Icon from "../Icon";
import Text from "../Text";

const SidePanelSectionField: React.FC<{
  publishedTheme?: PublishTheme;
  title: string;
  children?: ReactNode;
}> = ({ publishedTheme, title, children }) => {
  const theme = useTheme();
  const [opened, setOpened] = useState(false);

  return (
    <Field>
      <Header onClick={() => setOpened(!opened)}>
        <Text size="xs" color={theme.other.white} otherProperties={{ height: "16px" }}>
          {title}
        </Text>
        <ArrowIcon
          icon="arrowToggle"
          size={12}
          color={publishedTheme?.mainText || theme.main.text}
          opened={opened}
        />
      </Header>
      {opened && children}
    </Field>
  );
};

const Field = styled.div`
  box-sizing: border-box;

  border-bottom: 1px solid ${props => props.theme.main.paleBg};
`;
const Header = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;

  height: 32px;
  cursor: pointer;
`;
const ArrowIcon = styled(Icon)<{ opened: boolean }>`
  transform: rotate(${props => (props.opened ? 90 : 180)}deg);
`;

export default SidePanelSectionField;
