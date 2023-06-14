import { useState, ReactNode } from "react";

import { styled, colors, useTheme } from "@reearth/services/theme";

import useManageSwitchState from "../../hooks/useManageSwitchState/hooks";
import Icon from "../Icon";
import Text from "../Text";

export type SidePanelSectionItemProp = {
  label: string;
};

const SidePanelSectionField: React.FC<{
  title: string;
  items: SidePanelSectionItemProp[];
  onActive?: (index: number) => void;
  onAction?: (index: number) => void;
  renderPrefix?: (index: number, active: boolean) => ReactNode;
  children?: ReactNode;
}> = ({ title, items, onActive, onAction, renderPrefix, children }) => {
  const theme = useTheme();
  const [opened, setOpened] = useState(false);
  const { fields, handleActivate } = useManageSwitchState({
    fields: items.map((item, index) => {
      return { id: index.toString(), ...item };
    }),
  });

  return (
    <Field>
      <Header>
        <Text size="xs" color={theme.other.white} otherProperties={{ height: "16px" }}>
          {title}
        </Text>
        <OpenButton
          icon="arrowToggle"
          size={12}
          onClick={() => setOpened(!opened)}
          opened={opened}
        />
      </Header>
      {opened && children}
      {opened && (
        <List>
          {fields.map((item, index) => (
            <Item
              key={index}
              active={item.active}
              onClick={() => {
                handleActivate(item.id);
                onActive?.(index);
              }}>
              <ItemProperty>
                {renderPrefix?.(index, item.active ?? false)}
                <Text
                  size="xs"
                  color={colors.publish.dark.text.main}
                  otherProperties={{ height: "16px" }}>
                  {item.label}
                </Text>
              </ItemProperty>
              <Icon
                icon={"actionbutton"}
                size={16}
                onClick={() => {
                  onAction?.(index);
                }}
              />
            </Item>
          ))}
        </List>
      )}
    </Field>
  );
};

const Field = styled.div`
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  width: 100%;

  border-bottom: 1px solid ${colors.dark.bg[4]};

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
`;
const OpenButton = styled(Icon)<{ opened?: boolean }>`
  transform: rotate(${props => (props.opened ? 90 : 180)}deg);
  cursor: pointer;
`;
const List = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 8px;

  width: 100%;
`;
const Item = styled.button<{ active?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;

  align-self: stretch;

  ${props => (props.active ? "background: " + props.theme.leftMenu.highlighted + ";" : "")}
  ${props => (props.active ? "border-radius: 4px;" : "")}
  &:hover {${props =>
    props.active ? "" : "background: " + props.theme.main.lighterBg + "; border-radius: 0px;"}
`;
const ItemProperty = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export default SidePanelSectionField;
