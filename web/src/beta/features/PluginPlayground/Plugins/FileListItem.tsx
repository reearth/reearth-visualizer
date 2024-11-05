import { TextInput } from "@reearth/beta/lib/reearth-ui";
import { EntryItem } from "@reearth/beta/ui/components";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useMemo, useState } from "react";

import { FileType } from "./constants";
import usePlugins from "./hook";

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
              onClick: () => setIsEditing(true)
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
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleInputConfirm(e.currentTarget.value);
                }
              }}
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
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing.small,
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px ${theme.spacing.smallest}px ${theme.spacing.normal}px`,
  borderRadius: theme.radius.small,
  cursor: "pointer",
  "&:not(:first-child)": {
    marginTop: theme.spacing.smallest
  }
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  padding: `0 ${theme.spacing.smallest + 1}px`,
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}));

export default FileListItem;
