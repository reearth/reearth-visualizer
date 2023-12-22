import { useCallback, useState } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import type {
  LayerNameUpdateProps,
  LayerVisibilityUpdateProps,
} from "@reearth/beta/features/Editor/useLayers";
import { FlyTo } from "@reearth/beta/lib/core/types";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import LayerItem from "./LayerItem";

type LayersProps = {
  layers: NLSLayer[];
  selectedLayerId?: string;
  onLayerDelete: (id: string) => void;
  onLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
  onLayerSelect: (id: string) => void;
  onDataSourceManagerOpen: () => void;
  onSketchLayerManagerOpen: () => void;
  onLayerVisibilityUpate: (inp: LayerVisibilityUpdateProps) => void;
  onFlyTo?: FlyTo;
};

const Layers: React.FC<LayersProps> = ({
  layers,
  selectedLayerId,
  onLayerDelete,
  onLayerNameUpdate,
  onLayerSelect,
  onDataSourceManagerOpen,
  onSketchLayerManagerOpen,
  onLayerVisibilityUpate,
  onFlyTo,
}) => {
  const t = useT();
  const [isAddMenuOpen, setAddMenuOpen] = useState(false);

  const toggleAddMenu = useCallback(() => {
    setAddMenuOpen(prev => !prev);
  }, []);

  const handleZoomToLayer = () => {
    if (selectedLayerId) {
      onFlyTo?.(selectedLayerId, { duration: 0 });
    }
  };

  return (
    <LayerContainer>
      <ActionWrapper>
        <StyledIcon
          onClick={handleZoomToLayer}
          icon="zoomToLayer"
          size={16}
          disabled={!selectedLayerId}
        />
        <Popover.Provider open={isAddMenuOpen} onOpenChange={toggleAddMenu} placement="bottom-end">
          <Popover.Trigger asChild>
            <AddLayerIcon onClick={toggleAddMenu}>
              <Icon icon="addLayer" />
            </AddLayerIcon>
          </Popover.Trigger>

          <Popover.Content>
            <PopoverMenuContent
              size="sm"
              items={[
                {
                  name: t("Add Layer from Resource"),
                  icon: "file",
                  onClick: () => {
                    onDataSourceManagerOpen();
                    toggleAddMenu();
                  },
                },
                {
                  name: t("Add Sketch Layer"),
                  icon: "pencilSimple",
                  onClick: () => {
                    onSketchLayerManagerOpen();
                    toggleAddMenu();
                  },
                },
              ]}
            />
          </Popover.Content>
        </Popover.Provider>
      </ActionWrapper>

      {layers.map(layer => (
        <LayerItem
          key={layer.id}
          isSketchLayer={layer?.config?.data.isSketchLayer}
          id={layer.id}
          layerTitle={layer.title}
          visible={layer.visible}
          isSelected={layer.id === selectedLayerId}
          onDelete={() => onLayerDelete(layer.id)}
          onSelect={() => onLayerSelect(layer.id)}
          onLayerNameUpdate={onLayerNameUpdate}
          onLayerVisibilityUpate={onLayerVisibilityUpate}
        />
      ))}
    </LayerContainer>
  );
};

const LayerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ActionWrapper = styled.div`
  flex: 1;
  display: flex;
  gap: 10px;
  justify-content: right;
`;

const AddLayerIcon = styled.div`
  padding: 2px;
  margin-bottom: 2px;
  align-self: flex-end;
  cursor: pointer;
`;
const StyledIcon = styled(Icon)<{ disabled?: boolean }>`
  padding: 3px;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  color: ${({ disabled, theme }) => (disabled ? theme.content.weak : theme.content.strong)};
  border-radius: 5px;
`;
export default Layers;
