import Icon from "@reearth/beta/components/Icon";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

export type SceneSectionFieldProps = {
  scenes: {
    id: string;
    label: string;
    active?: boolean;
  }[];
  onActive?: (id: string) => void;
  onAction?: (id: string) => void;
};

const SceneSectionField: React.FC<SceneSectionFieldProps> = ({ scenes, onActive, onAction }) => {
  const theme = useTheme();

  return (
    <SidePanelSectionField title="scene">
      <List>
        {scenes.map((item, index) => (
          <Item
            key={index}
            active={item.active}
            onClick={() => {
              onActive?.(item.id);
            }}>
            <ItemProperty>
              <ItemSpace />
              <Text
                size="footnote"
                color={theme.general.content.main}
                otherProperties={{ height: "16px" }}>
                {item.label}
              </Text>
            </ItemProperty>
            <Icon
              icon={"actionbutton"}
              size={16}
              color={theme.general.content.main}
              onClick={() => {
                onAction?.(item.id);
              }}
            />
          </Item>
        ))}
      </List>
    </SidePanelSectionField>
  );
};

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

  ${props => (props.active ? "background: " + props.theme.general.select + ";" : "")}
  ${props => (props.active ? "border-radius: 4px;" : "")}
  &:hover {${props =>
    props.active ? "" : "background: " + props.theme.general.bg.weak + "; border-radius: 0px;"}
`;
const ItemProperty = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
const ItemSpace = styled.div`
  box-sizing: border-box;

  width: 20px;
  height: 20px;
`;

export default SceneSectionField;
