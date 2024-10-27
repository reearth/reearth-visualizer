import { Button, Icon, TextInput } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import { FileType } from "../hooks";

const FileListItem: FC<{
  file: FileType;
  selected: boolean;
  onClick: () => void;
  updateFileTitle: (id: string, name: string) => void;
  deleteFile: (id: string) => void;
}> = ({ file, selected, onClick, updateFileTitle, deleteFile }) => {
  const [isEditing, setIsEditig] = useState(false);
  const isNewFile = file.title === "";

  const handleInputConfirm = useCallback(
    (value: string) => {
      if (value === "") {
        if (isNewFile) {
          deleteFile(file.id);
        }
        setIsEditig(false);
        return;
      }
      updateFileTitle(file.id, value);
      setIsEditig(false);
    },
    [file.id, isNewFile, updateFileTitle, deleteFile]
  );

  return (
    <FileListItemWrapper selected={selected} onClick={onClick}>
      <Icon icon="file" />
      {file.title === "" || isEditing ? (
        <TextInput
          size="small"
          extendWidth
          autoFocus
          onBlur={handleInputConfirm}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleInputConfirm(e.currentTarget.value);
            }
          }}
          value={file.title}
        />
      ) : (
        <>
          {file.title}
          <Button
            appearance="simple"
            icon="pencilSimple"
            size="small"
            iconButton
            onClick={() => setIsEditig(true)}
          />
        </>
      )}
    </FileListItemWrapper>
  );
};

const FileListItemWrapper = styled("li")<{
  selected?: boolean;
}>(({ theme, selected }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing.small,
  paddingTop: theme.spacing.smallest,
  paddingRight: theme.spacing.small,
  paddingLeft: theme.spacing.normal,
  paddingBottom: theme.spacing.smallest,
  borderRadius: theme.radius.small,
  backgroundColor: selected ? theme.select.main : "transparent",
  cursor: "pointer",
  "&:not(:first-child)": {
    marginTop: theme.spacing.smallest
  }
}));

export default FileListItem;
