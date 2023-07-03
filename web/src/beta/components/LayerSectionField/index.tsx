import Icon from "@reearth/beta/components/Icon";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import { SwitchField } from "@reearth/beta/hooks/useManageSwitchState/hooks";
import { styled, useTheme } from "@reearth/services/theme";

import LayerSectionItem, { LayerSectionItemProps } from "./item";

export type LayerSectionFieldProps = {
  layers: SwitchField<LayerSectionItemProps>[];
  onClickLayerAdd?: () => void;
  onActive?: (id: string) => void;
  onClickAction?: (id: string) => void;
  onClickVisible?: (id: string) => void;
};

const LayerSectionField: React.FC<LayerSectionFieldProps> = ({
  layers,
  onClickLayerAdd,
  onActive,
  onClickAction,
  onClickVisible,
}) => {
  const theme = useTheme();

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
        {layers.map((item, index) => (
          <LayerSectionItem
            key={index}
            layer={item}
            onActive={onActive}
            onClickAction={onClickAction}
            onClickVisible={onClickVisible}
          />
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

  cursor: pointer;
`;
const List = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 8px;
`;

export default LayerSectionField;
