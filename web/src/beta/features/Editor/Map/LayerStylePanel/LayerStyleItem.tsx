
import { TextInput } from "@reearth/beta/lib/reearth-ui";
import { EntryItem } from "@reearth/beta/ui/components";
import { styled } from "@reearth/services/theme";
import { FC, MouseEvent, useCallback, useState } from "react";

import { LayerStyleNameUpdateProps } from "../../hooks/useLayerStyles";

type LayerStyleItemProps = {
  id?: string;
  name: string;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
  onLayerStyleNameUpdate: (inp: LayerStyleNameUpdateProps) => void;
};

const LayerStyleItem: FC<LayerStyleItemProps> = ({
  id,
  name,
  selected,
  onSelect,
  onDelete,
  onLayerStyleNameUpdate,
}) => {
  const [localName, setLocalName] = useState(name);
  const [isEditing, setIsEditing] = useState(false);

  const handleNameUpdate = useCallback(() => {
    if (id && localName !== name) {
      onLayerStyleNameUpdate({ styleId: id, name: localName });
    }
    setIsEditing(false);
  }, [id, name, localName, onLayerStyleNameUpdate]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onSelect?.();
    },
    [onSelect],
  );

  return (
    <EntryItem
      title={
        isEditing ? (
          <TextInput
            size="small"
            extendWidth
            autoFocus
            value={localName}
            onChange={setLocalName}
            onBlur={handleNameUpdate}
          />
        ) : (
          <TitleWrapper onDoubleClick={() => setIsEditing(true)}>{localName}</TitleWrapper>
        )
      }
      highlighted={selected}
      onClick={handleClick}
      optionsMenu={[
        {
          id: "delete",
          title: "Delete",
          icon: "trash" as const,
          onClick: onDelete,
        },
      ]}
    />
  );
};

const TitleWrapper = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.smallest + 1}px`,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

export default LayerStyleItem;
