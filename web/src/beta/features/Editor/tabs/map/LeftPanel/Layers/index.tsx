import React, { useCallback, useState } from "react";

import TextInput from "@reearth/beta/components/fields/TextInput";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Text from "@reearth/beta/components/Text";
import type { LayerNameUpdateProps } from "@reearth/beta/features/Editor/useLayers";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { styled } from "@reearth/services/theme";

type LayersProps = {
  layers: NLSLayer[];
  onLayerDelete: (id: string) => void;
  onLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
  onLayerSelect: (id: string) => void;
  onDataSourceManagerOpen: () => void;
};

const Layers: React.FC<LayersProps> = ({
  layers,
  onLayerDelete,
  onLayerNameUpdate,
  onLayerSelect,
  onDataSourceManagerOpen,
}) => {
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
          id={layer.id}
          layerTitle={layer.title}
          onDelete={() => onLayerDelete(layer.id)}
          onSelect={() => onLayerSelect(layer.id)}
          onLayerNameUpdate={onLayerNameUpdate}
        />
      ))}
    </LayerContainer>
  );
};

type LayerItemProps = {
  id: string;
  layerTitle: string;
  onDelete: () => void;
  onSelect: () => void;
  onLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
};

const LayerItem = ({ id, layerTitle, onDelete, onSelect, onLayerNameUpdate }: LayerItemProps) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(layerTitle);
  const [prevTitle, setPrevTitle] = useState(layerTitle);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setPrevTitle(editedTitle);
  }, [editedTitle]);

  const handleTitleSubmit = useCallback(() => {
    if (!editedTitle.trim()) {
      return;
    }
    setIsEditing(false);
    onLayerNameUpdate({ layerId: id, name: editedTitle });
  }, [editedTitle, id, onLayerNameUpdate]);

  const handleKeyUp = useCallback(
    (e: { key: string }) => {
      if (["Enter", "Return"].includes(e.key)) {
        handleTitleSubmit();
      }
    },
    [handleTitleSubmit],
  );

  const handleBlur = () => {
    setIsEditing(false);
    setEditedTitle(prevTitle);
  };

  return (
    <ListItemContainer onClick={onSelect}>
      <div onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <TextInput
            value={editedTitle}
            onChange={(newTitle: string) => setEditedTitle(newTitle)}
            onKeyUp={handleKeyUp}
            onBlur={handleBlur}
          />
        ) : (
          <Text size="body">{layerTitle}</Text>
        )}
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
