import { useCallback, useState } from "react";

import TextInput from "@reearth/beta/components/fields/TextInput";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Text from "@reearth/beta/components/Text";
import type { LayerNameUpdateProps } from "@reearth/beta/features/Editor/useLayers";
import { styled } from "@reearth/services/theme";

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
  const [newValue, setNewValue] = useState(layerTitle);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleChange = useCallback((newTitle: string) => {
    setNewValue(newTitle);
  }, []);

  const handleTitleSubmit = useCallback(() => {
    setIsEditing(false);
    onLayerNameUpdate({ layerId: id, name: newValue });
  }, [id, newValue, onLayerNameUpdate]);

  const handleEditExit = useCallback(() => {
    handleTitleSubmit();
    setIsEditing(false);
  }, [handleTitleSubmit]);

  return (
    <ListItemContainer onClick={onSelect}>
      <div onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <TextInput
            value={newValue}
            timeout={0}
            onChange={handleChange}
            onExit={handleEditExit}
            onBlur={handleEditExit}
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

const ListItemContainer = styled.div`
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MenuIcon = styled.div`
  cursor: pointer;
`;

export default LayerItem;
