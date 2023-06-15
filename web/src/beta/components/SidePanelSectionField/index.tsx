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
        <Icon
          icon="arrowToggle"
          size={12}
          color={publishedTheme?.mainText || theme.main.text}
          style={{ rotate: opened ? "90deg" : "180deg" }}
        />
      </Header>
      {opened && children}
    </Field>
  );
};

const Field = styled.div`
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  width: 100%;

  border-bottom: 1px solid ${props => props.theme.main.paleBg};

  align-self: stretch;
`;
const Header = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;

  width: 100%;
  height: 32px;

  align-self: stretch;
  cursor: pointer;
`;

export default SidePanelSectionField;
