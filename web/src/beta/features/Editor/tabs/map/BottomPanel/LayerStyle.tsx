import { ReactNode, useCallback } from "react";

import Icon from "@reearth/beta/components/Icon";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import type {
  LayerStyleAddProps,
  LayerStyleNameUpdateProps,
} from "@reearth/beta/features/Editor/useLayerStyles";
import type { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { styled } from "@reearth/services/theme";

import LayerStyleCard from "./LayerStyleCard";

type LayerStylesProps = {
  layerStyles: LayerStyle[];
  selectedLayerStyleId?: string;
  actionContent?: ReactNode;
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
          <LayerStyleCard
            id={layerStyle.id}
            key={layerStyle.id}
            name={layerStyle.name}
            onLayerStyleNameUpdate={onLayerStyleNameUpdate}
            selected={layerStyle.id === selectedLayerStyleId}
            actionContent={
              <PopoverMenuContent
                size="sm"
                items={[
                  {
                    name: "Delete",
                    icon: "bin",
                    onClick: (e?: React.MouseEvent) => {
                      e?.stopPropagation();
                      onLayerStyleDelete(layerStyle.id);
                    },
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
  height: calc(100% - 4px);
  padding: 2px;
`;

const Sidebar = styled.div`
  display: flex;
  align-items: center;
`;

const CatalogListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  overflow-y: auto;
  justify-content: flex-start;
  flex: 1;
`;

const AdjustableButtonStyled = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 8px;
  margin-right: 2px;
  color: ${({ theme }) => theme.content.main};
  width: 32px;
  height: calc(100% - 4px);

  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.secondary.main};
  background: ${({ theme }) => theme.bg[1]};

  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25);
  transition: all 0.3s;

  :hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;

export default LayerStyles;
