import Icon from "@reearth/beta/components/Icon";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import { styled, useTheme } from "@reearth/services/theme";

import LayerSectionItem, { LayerSectionItemProps } from "./item";

export type LayerSectionFieldProps = {
  layers: LayerSectionItemProps[];
  onClickLayerAdd?: () => void;
  onActive?: (id: string) => void;
  onAction?: (id: string) => void;
  onVisible?: (id: string) => void;
};

const LayerSectionField: React.FC<LayerSectionFieldProps> = ({
  layers,
  onClickLayerAdd,
  onActive,
  onAction,
  onVisible,
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
            onAction={onAction}
            onVisible={onVisible}
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

export default LayerSectionField;
