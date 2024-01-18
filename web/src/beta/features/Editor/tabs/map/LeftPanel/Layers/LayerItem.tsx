import { MouseEvent, useCallback, useEffect, useState } from "react";

import TextInput from "@reearth/beta/components/fields/common/TextInput";
import ListItem from "@reearth/beta/components/ListItem";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Text from "@reearth/beta/components/Text";
import type {
  LayerNameUpdateProps,
  LayerVisibilityUpdateProps,
} from "@reearth/beta/features/Editor/useLayers";
import useDoubleClick from "@reearth/beta/utils/use-double-click";
import { styled } from "@reearth/services/theme";

type LayerItemProps = {
  id: string;
  layerTitle: string;
  isSelected: boolean;
  visible: boolean;
  isSketchLayer?: boolean;
  onDelete: () => void;
  onSelect: () => void;
  onLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
  onLayerVisibilityUpate: (inp: LayerVisibilityUpdateProps) => void;
};

const LayerItem = ({
  id,
  layerTitle,
  isSelected,
  visible,
  isSketchLayer,
  onDelete,
  onSelect,
  onLayerNameUpdate,
  onLayerVisibilityUpate,
}: LayerItemProps) => {
  const [isActionOpen, setActionOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(layerTitle);
  const [isVisible, setIsVisible] = useState(visible);
  const [value, setValue] = useState(isVisible ? "V" : "");

  const handleActionMenuToggle = useCallback(() => setActionOpen(prev => !prev), []);

  const [handleSingleClick, handleDoubleClick] = useDoubleClick(
    () => onSelect?.(),
    () => setIsEditing(true),
  );

  useEffect(() => {
    setNewValue(layerTitle);
  }, [layerTitle]);

  const handleTitleSubmit = useCallback(
    (newTitle: string) => {
      setNewValue(newTitle);
      setIsEditing(false);
      if (newTitle.trim() !== "") {
        onLayerNameUpdate({ layerId: id, name: newTitle });
      }
    },
    [id, onLayerNameUpdate],
  );

  const handleEditExit = useCallback(
    (e?: React.KeyboardEvent<HTMLInputElement>) => {
      if (layerTitle !== newValue && e?.key !== "Escape") {
        handleTitleSubmit(newValue);
      } else {
        setNewValue(layerTitle);
      }
      setIsEditing(false);
    },
    [layerTitle, newValue, handleTitleSubmit],
  );

  const handleUpdateVisibility = useCallback(
    (e?: MouseEvent<Element>) => {
      e?.stopPropagation();
      const newVisibility = !isVisible;
      onLayerVisibilityUpate({ layerId: id, visible: newVisibility });
      setIsVisible(newVisibility);
      setValue(isVisible ? "" : "V");
    },
    [id, isVisible, onLayerVisibilityUpate],
  );

  return (
    <ListItem
      isSelected={isSelected}
      isOpenAction={isActionOpen}
      actionPlacement="bottom-end"
      onItemClick={handleSingleClick}
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
      <>
        {isEditing ? (
          <StyledTextInput
            value={newValue}
            autoFocus
            onChange={handleTitleSubmit}
            onExit={handleEditExit}
            onBlur={handleEditExit}
          />
        ) : (
          <TitleText size="footnote" onDoubleClick={handleDoubleClick}>
            {layerTitle}
          </TitleText>
        )}
        {isSketchLayer && <SketchLayer>S</SketchLayer>}
        <HideLayer onClick={handleUpdateVisibility}>
          <Text size="footnote">{value}</Text>
        </HideLayer>
      </>
    </ListItem>
  );
};

export default LayerItem;

const TitleText = styled(Text)`
  flex: 1;
  word-break: break-all;
  text-align: left;
  padding-right: 10px;
`;

const HideLayer = styled.div`
  display: flex;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
  border-radius: 4px;
  border: 1.5px solid ${({ theme }) => theme.bg[1]};
  color: ${({ theme }) => theme.content.strong};
  background: ${({ theme }) => theme.bg[2]};

  :hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;

const SketchLayer = styled.div`
  display: flex;
  padding-right: 12px;
`;
const StyledTextInput = styled(TextInput)`
  width: 100%;
  font-size: 12px;
  color: ${({ theme }) => theme.content.main};
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;
