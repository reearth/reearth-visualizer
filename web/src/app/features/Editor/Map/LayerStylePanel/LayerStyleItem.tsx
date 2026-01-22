import { TextInput } from "@reearth/app/lib/reearth-ui";
import { EntryItem } from "@reearth/app/ui/components";
import { useT } from "@reearth/services/i18n";
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
  onLayerStyleNameUpdate
}) => {
  const t = useT();
  const [localName, setLocalName] = useState(name);
  const [isEditing, setIsEditing] = useState(false);

  const handleNameUpdate = useCallback(() => {
    if (id && localName && localName !== name) {
      onLayerStyleNameUpdate({ styleId: id, name: localName });
    } else setLocalName(name);
    setIsEditing(false);
  }, [localName, name, onLayerStyleNameUpdate, id]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      onSelect?.();
    },
    [onSelect]
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
          <TitleWrapper onDoubleClick={() => setIsEditing(true)}>
            {localName}
          </TitleWrapper>
        )
      }
      highlighted={selected}
      onClick={handleClick}
      optionsMenu={[
        {
          id: "rename",
          title: t("Rename"),
          icon: "pencilSimple" as const,
          onClick: () => {
            setTimeout(() => {
              setIsEditing(true);
            }, 0);
          }
        },
        {
          id: "delete",
          title: t("Delete"),
          icon: "trash" as const,
          onClick: onDelete
        }
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
  whiteSpace: "nowrap"
}));

export default LayerStyleItem;
