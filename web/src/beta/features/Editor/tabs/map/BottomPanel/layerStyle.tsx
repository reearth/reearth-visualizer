import { useCallback } from "react";

import CatalogCard from "@reearth/beta/components/CatalogCard";
import Icon from "@reearth/beta/components/Icon";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import type {
  LayerStyleAddProps,
  LayerStyleNameUpdateProps,
} from "@reearth/beta/features/Editor/useLayerStyles";
import type { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { styled } from "@reearth/services/theme";

type LayerStylesProps = {
  layerStyles: LayerStyle[];
  selectedLayerStyleId?: string;
  onLayerStyleAdd: (inp: LayerStyleAddProps) => void;
  onLayerStyleDelete: (id: string) => void;
  onLayerStyleNameUpdate: (inp: LayerStyleNameUpdateProps) => void;
  onLayerStyleSelect: (id: string) => void;
};

const LayerStyles: React.FC<LayerStylesProps> = ({
  layerStyles,
  selectedLayerStyleId,
  onLayerStyleAdd,
  onLayerStyleDelete,
  onLayerStyleNameUpdate,
  onLayerStyleSelect,
}) => {
  const handleLayerStyleAddition = useCallback(() => {
    onLayerStyleAdd({ name: `Style_${layerStyles.length + 1}`, value: {} });
  }, [layerStyles.length, onLayerStyleAdd]);

  const handleSelectLayerStyle = useCallback(
    (layerStyle?: LayerStyle) => {
      if (!layerStyle) return;
      onLayerStyleSelect(layerStyle.id);
    },
    [onLayerStyleSelect],
  );

  return (
    <LayerStyleContainer>
      <AddLayerStyleIcon onClick={handleLayerStyleAddition}>
        <Icon icon="addLayerStyle" />
      </AddLayerStyleIcon>

      {/* <AdjustableButton onClick={han}></AdjustableButton> */}

      <CatalogListWrapper>
        {layerStyles.map(layerStyle => (
          <CatalogCard
            id={layerStyle.id}
            key={layerStyle.id}
            name={layerStyle.name}
            icon="layerStyle"
            onLayerStyleNameUpdate={onLayerStyleNameUpdate}
            isNameEditable={true}
            selected={layerStyle.id === selectedLayerStyleId}
            actionContent={
              <PopoverMenuContent
                size="sm"
                items={[
                  {
                    name: "Delete",
                    icon: "bin",
                    onClick: () => onLayerStyleDelete(layerStyle.id),
                  },
                ]}
              />
            }
            onSelect={() => handleSelectLayerStyle(layerStyle)}
          />
        ))}
      </CatalogListWrapper>
    </LayerStyleContainer>
  );
};

const LayerStyleContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const AddLayerStyleIcon = styled.div`
  align-self: flex-end;
  cursor: pointer;
`;

const CatalogListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 240px);
`;

export default LayerStyles;
