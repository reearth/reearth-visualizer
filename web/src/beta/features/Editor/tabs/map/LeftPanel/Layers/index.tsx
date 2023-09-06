import React from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Text from "@reearth/beta/components/Text";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { styled } from "@reearth/services/theme";

type LayersProps = {
  layers: NLSLayer[];
  onLayerDelete: (id: string) => void;
  onLayerSelect: (id: string) => void; // Todo
  onDataSourceManagerOpen: () => void;
};

const Layers: React.FC<LayersProps> = ({
  layers,
  onLayerDelete,
  onLayerSelect,
  onDataSourceManagerOpen,
}) => {
  const [isAddMenuOpen, setAddMenuOpen] = React.useState(false);

  const toggleAddMenu = () => setAddMenuOpen(prev => !prev);

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
                name: "Add Layer from Resource",
                icon: "file",
                onClick: () => {
                  onDataSourceManagerOpen();
                  toggleAddMenu();
                },
              },
              {
                name: "Add Sketch Layer",
                icon: "pencilSimple",
                onClick: () => {},
              },
            ]}
          />
        </Popover.Content>
      </Popover.Provider>
      {layers.map(layer => (
        <LayerItem
          key={layer.id}
          layerTitle={layer.title}
          onDelete={() => onLayerDelete(layer.id)}
          onSelect={() => onLayerSelect(layer.id)}
        />
      ))}
    </LayerContainer>
  );
};

type LayerItemProps = {
  layerTitle: string;
  onDelete: () => void;
  onSelect: () => void;
};

const LayerItem: React.FC<LayerItemProps> = ({ layerTitle, onDelete, onSelect }) => {
  const [isMenuOpen, setMenuOpen] = React.useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <ListItemContainer onClick={onSelect}>
      <div>
        <Text size="body">{layerTitle}</Text>
      </div>
      <div>
        <Popover.Provider open={isMenuOpen} onOpenChange={toggleMenu} placement="left-start">
          <Popover.Trigger asChild>
            <MenuIcon onClick={toggleMenu}>
              <Icon icon="actionbutton" />
            </MenuIcon>
          </Popover.Trigger>
          <Popover.Content>
            <PopoverMenuContent
              size="md"
              items={[
                {
                  name: "Delete",
                  icon: "bin",
                  onClick: onDelete,
                },
              ]}
            />
          </Popover.Content>
        </Popover.Provider>
      </div>
    </ListItemContainer>
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

const ListItemContainer = styled.div`
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MenuIcon = styled.div`
  cursor: pointer;
`;

export default Layers;
