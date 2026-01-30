import { TextInput } from "@reearth/app/lib/reearth-ui";
import { EntryItem } from "@reearth/app/ui/components";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback, useMemo, useState } from "react";

import { FileType } from "./constants";
import usePlugins from "./usePlugins";

type UsePluginsReturn = ReturnType<typeof usePlugins>;

type Props = {
  file: FileType;
  selected: boolean;
  onClick?: () => void;
  isEditing?: boolean;
  confirmFileTitle: (value: string, id: string) => void;
  deleteFile?: UsePluginsReturn["deleteFile"];
};

const FileListItem: FC<Props> = ({
  file,
  selected,
  onClick,
  confirmFileTitle,
  deleteFile,
  isEditing: isEditingProp
}) => {
  const [isEditing, setIsEditing] = useState(isEditingProp);

  const handleInputConfirm = useCallback(
    (value: string) => {
      confirmFileTitle(value, file.id);
      setIsEditing(false);
    },
    [confirmFileTitle, file.id]
  );

  const optionsMenu = useMemo(() => {
    const menuItems = [
      ...(!file.disableDelete
        ? [
            {
              id: "delete",
              title: "Delete",
              icon: "trash" as const,
              onClick: () => deleteFile?.(file.id)
            }
          ]
        : []),
      ...(!file.disableEdit
        ? [
            {
              id: "rename",
              title: "Rename",
              icon: "pencilSimple" as const,
              onClick: () => {
                // Delay entering edit mode until popup has fully closed and finished focus management
                setTimeout(() => {
                  setIsEditing(true);
                }, 0);
              }
            }
          ]
        : [])
    ];

    return menuItems.length > 0 ? menuItems : undefined;
  }, [deleteFile, file.id, file.disableDelete, file.disableEdit]);

  return (
    <Wrapper>
      <EntryItem
        icon="file"
        title={
          isEditing ? (
            <TextInput
              size="small"
              extendWidth
              autoFocus
              value={file.title}
              onBlur={handleInputConfirm}
            />
          ) : (
            <TitleWrapper>{file.title}</TitleWrapper>
          )
        }
        highlighted={selected}
        optionsMenuWidth={100}
        onClick={onClick}
        optionsMenu={!isEditing ? optionsMenu : undefined}
      />
    </Wrapper>
  );
};

const Wrapper = styled("li")(({ theme }) => ({
  display: css.display.flex,
  justifyContent: css.justifyContent.spaceBetween,
  alignItems: css.alignItems.center,
  gap: theme.spacing.small,
  borderRadius: theme.radius.small,
  cursor: css.cursor.pointer
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.smallest + 1}px`,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: css.overflow.hidden,
  textOverflow: css.textOverflow.ellipsis,
  whiteSpace: css.whiteSpace.nowrap
}));

export default FileListItem;
