import { MouseEvent, useCallback, useState } from "react";

import TextInput from "@reearth/beta/components/fields/common/TextInput";
import ListItem from "@reearth/beta/components/ListItem";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Text from "@reearth/beta/components/Text";
import type { LayerNameUpdateProps } from "@reearth/beta/features/Editor/useLayers";

type LayerItemProps = {
  id: string;
  layerTitle: string;
  isSelected: boolean;
  onDelete: () => void;
  onSelect: () => void;
  onLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
};

const LayerItem = ({
  id,
  layerTitle,
  isSelected,
  onDelete,
  onSelect,
  onLayerNameUpdate,
}: LayerItemProps) => {
  const [isActionOpen, setActionOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(layerTitle);

  const handleActionMenuToggle = useCallback(() => setActionOpen(prev => !prev), []);

  const handleClick = useCallback(
    (e?: MouseEvent<Element>) => {
      if (e?.shiftKey) {
        e?.stopPropagation();
        setIsEditing(true);
        return;
      }
      onSelect();
    },
    [onSelect],
  );

  const handleChange = useCallback((newTitle: string) => setNewValue(newTitle), []);

  const handleTitleSubmit = useCallback(() => {
    setIsEditing(false);
    onLayerNameUpdate({ layerId: id, name: newValue });
  }, [id, newValue, onLayerNameUpdate]);

  const handleEditExit = useCallback(
    (e?: React.KeyboardEvent<HTMLInputElement>) => {
      if (layerTitle !== newValue && e?.key !== "Escape") {
        handleTitleSubmit();
      } else {
        setNewValue(layerTitle);
      }
      setIsEditing(false);
    },
    [layerTitle, newValue, handleTitleSubmit],
  );

  return (
    <ListItem
      isSelected={isSelected}
      isOpenAction={isActionOpen}
      actionPlacement="bottom-start"
      onItemClick={handleClick}
      onActionClick={handleActionMenuToggle}
      onOpenChange={isOpen => setActionOpen(!!isOpen)}
      actionContent={
        <PopoverMenuContent
          size="sm"
          items={[
            {
              name: "Delete",
              icon: "bin",
              onClick: onDelete,
            },
          ]}
        />
      }>
      {isEditing ? (
        <TextInput
          value={newValue}
          timeout={0}
          autoFocus
          onChange={handleChange}
          onExit={handleEditExit}
          onBlur={handleEditExit}
        />
      ) : (
        <Text size="body">{layerTitle}</Text>
      )}
    </ListItem>
  );
};

export default LayerItem;
