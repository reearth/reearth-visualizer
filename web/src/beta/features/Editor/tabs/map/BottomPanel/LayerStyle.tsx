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
      <Sidebar>
        <AdjustableButtonStyled onClick={handleLayerStyleAddition}>
          <Icon icon="plus" />
        </AdjustableButtonStyled>
      </Sidebar>
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
  align-items: flex-start;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CatalogListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 240px);
  justify-content: flex-start;
  flex: 1;
`;

const AdjustableButtonStyled = styled.button`
  display: flex;
  padding: var(--spacing-small, 8px);
  justify-content: center;
  align-items: center;
  gap: var(--spacing-small, 8px);
  color: ${({ theme }) => theme.content.main};
  width: 32px;
  min-height: 100px;
  max-height: 200px;

  border-radius: var(--radius-normal, 6px);
  border: 1px solid ${({ theme }) => theme.secondary.main};
  background: ${({ theme }) => theme.bg[1]};

  position: sticky;
  top: 0;

  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25);
`;

export default LayerStyles;
