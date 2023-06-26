import { useState } from "react";

import Icon from "@reearth/beta/components/Icon";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import Text from "@reearth/beta/components/Text";
import useManageSwitchState from "@reearth/beta/hooks/useManageSwitchState/hooks";
import { styled, useTheme } from "@reearth/services/theme";

type LayerSectionItemProps = {
  label: string;
  visible?: boolean;
};

export type LayerSectionFieldProps = {
  layers: LayerSectionItemProps[];
  onClickLayerAdd?: () => void;
  onActive?: (index: number) => void;
  onAction?: (index: number) => void;
  onVisible?: (index: number) => void;
};

const LayerSectionField: React.FC<LayerSectionFieldProps> = ({
  layers,
  onClickLayerAdd,
  onActive,
  onAction,
  onVisible,
}) => {
  const theme = useTheme();
  const [visibles] = useState(layers);

  const { fields, handleActivate } = useManageSwitchState({
    fields: layers.map((item, index) => {
      return { id: index.toString(), ...item };
    }),
  });

  return (
    <SidePanelSectionField title="Layers">
      <LayerAddFrame>
        <Icon
          icon="layerAdd"
          size={14}
          color={theme.general.content.main}
          onClick={onClickLayerAdd}
        />
      </LayerAddFrame>
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
              <ItemVisibility
                active={item.active}
                color={theme.general.content.main}
                onClick={() => onVisible?.(index)}>
                {visibles[index].visible && <ItemVisibilityIcon icon="checkOnVisibility" />}
              </ItemVisibility>
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
                onAction?.(index);
              }}
            />
          </Item>
        ))}
      </List>
    </SidePanelSectionField>
  );
};
const LayerAddFrame = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: flex-end;
  padding: 0px 8px;

  width: 100%;
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
const ItemVisibility = styled.div<{ active?: boolean; onClick?: () => void }>`
  box-sizing: border-box;

  width: 20px;
  height: 20px;

  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 4px;
`;
const ItemVisibilityIcon = styled(Icon)`
  padding-left: 30%;
  padding-right: 33.44%;
  padding-top: 30%;
  padding-bottom: 27.34%;
`;

export default LayerSectionField;
