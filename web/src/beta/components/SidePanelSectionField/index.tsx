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
        <Text
          size="footnote"
          color={theme.general.content.strong}
          otherProperties={{ height: "16px" }}>
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
  box-sizing: border-box;

  border-bottom: 1px solid ${props => props.theme.general.bg.weak};
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
