import { MouseEvent, useCallback, useState } from "react";

import TextInput from "@reearth/beta/components/fields/common/TextInput";
import ListItem from "@reearth/beta/components/ListItem";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import type { LayerNameUpdateProps } from "@reearth/beta/features/Editor/useLayers";
import { styled } from "@reearth/services/theme";

type LayerItemProps = {
  id: string;
  layerTitle: string;
  isSelected: boolean;
  visible: boolean;
  onDelete: () => void;
  onSelect: () => void;
  onLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
};

const LayerItem = ({
  id,
  layerTitle,
  isSelected,
  visible,
  onDelete,
  onSelect,
  onLayerNameUpdate,
}: LayerItemProps) => {
  const [isActionOpen, setActionOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(layerTitle);
  const [isVisible, setIsVisible] = useState(visible);
  const [value, setValue] = useState(isVisible ? "V" : "");

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

  const handleLayerVisibilityUpdate = useCallback(() => {
    const newVisibility = !isVisible;
    onLayerNameUpdate({ layerId: id, visible: newVisibility });
    setIsVisible(newVisibility);
    setValue(isVisible ? "" : "V");
  }, [id, isVisible, onLayerNameUpdate]);

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
        layerTitle
      )}
      <HideLayer onClick={handleLayerVisibilityUpdate}>{value}</HideLayer>
    </ListItem>
  );
};

export default LayerItem;

const HideLayer = styled.div`
  min-width: 10px;
  min-height: 20px;
  padding: 3px 6px 0;
  cursor: pointer;
  border-radius: 4px;
  border: 1.5px solid ${({ theme }) => theme.bg[1]};
  color: ${({ theme }) => theme.content.strong};
  background: ${({ theme }) => theme.bg[2]};
  position: absolute;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  :hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;
