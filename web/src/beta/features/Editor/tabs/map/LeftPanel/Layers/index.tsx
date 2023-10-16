import { useCallback, useState } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import type { LayerUpdateProps } from "@reearth/beta/features/Editor/useLayers";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import LayerItem from "./LayerItem";

type LayersProps = {
  layers: NLSLayer[];
  selectedLayerId?: string;
  onLayerDelete: (id: string) => void;
  onLayerNameUpdate: (inp: LayerUpdateProps) => void;
  onLayerSelect: (id: string) => void;
  onDataSourceManagerOpen: () => void;
  onLayerVisibilityUpate: (inp: LayerUpdateProps) => void;
};

const Layers: React.FC<LayersProps> = ({
  layers,
  selectedLayerId,
  onLayerDelete,
  onLayerNameUpdate,
  onLayerSelect,
  onDataSourceManagerOpen,
  onLayerVisibilityUpate,
}) => {
  const t = useT();
  const [isAddMenuOpen, setAddMenuOpen] = useState(false);

  const toggleAddMenu = useCallback(() => {
    setAddMenuOpen(prev => !prev);
  }, []);

  return (
    <LayerContainer>
      <Popover.Provider open={isAddMenuOpen} onOpenChange={toggleAddMenu} placement="bottom-end">
        <Popover.Trigger asChild>
          <AddLayerIcon onClick={toggleAddMenu}>
            <Icon icon="addLayer" />
          </AddLayerIcon>
        </Popover.Trigger>

        <Popover.Content>
          <PopoverMenuContent
            size="md"
            items={[
              {
                name: t("Add Layer from Resource"),
                icon: "file",
                onClick: () => {
                  onDataSourceManagerOpen();
                  toggleAddMenu();
                },
              },
              // {
              //   name: t("Add Sketch Layer"),
              //   icon: "pencilSimple",
              //   onClick: () => {},
              // },
            ]}
          />
        </Popover.Content>
      </Popover.Provider>
      {layers.map(layer => (
        <LayerItem
          key={layer.id}
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

const AddLayerIcon = styled.div`
  padding: 2px;
  margin-bottom: 2px;
  align-self: flex-end;
  cursor: pointer;
`;

export default Layers;
