import { ReactNode, useCallback } from "react";

import Icon from "@reearth/beta/components/Icon";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import type {
  LayerStyleAddProps,
  LayerStyleNameUpdateProps,
} from "@reearth/beta/features/Editor/useLayerStyles";
import type { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
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
  const t = useT();

  const handleLayerStyleAddition = useCallback(() => {
    onLayerStyleAdd({ name: `${t("Style_")}${layerStyles.length + 1}`, value: {} });
  }, [layerStyles.length, t, onLayerStyleAdd]);

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
                    name: t("Delete"),
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
  height: 100%;
`;

const Sidebar = styled.div`
  display: flex;
  align-items: center;
  padding: 2px;
`;

const CatalogListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 12px;
  overflow-y: auto;
  padding: 12px 8px;
`;

const AdjustableButtonStyled = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 8px;
  color: ${({ theme }) => theme.content.main};
  width: 32px;
  height: 100%;

  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  background: ${({ theme }) => theme.bg[1]};

  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25);
  transition: all 0.3s;

  :hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;

export default LayerStyles;
