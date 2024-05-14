import React, { useCallback, useEffect, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Property from "@reearth/beta/components/fields";
import TextInput from "@reearth/beta/components/fields/common/TextInput";
import { FILE_FORMATS, IMAGE_FORMATS } from "@reearth/beta/features/Assets/constants";
import { AcceptedFileFormat } from "@reearth/beta/features/Assets/types";
import AssetModal from "@reearth/beta/features/Modals/AssetModal";
import LayerStyleModal from "@reearth/beta/features/Modals/LayerStyleModal";
import useFileUploaderHook from "@reearth/beta/hooks/useAssetUploader/hooks";
import { checkIfFileType } from "@reearth/beta/utils/util";
import { useT } from "@reearth/services/i18n";
import { useNotification, useWorkspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

export type Props = {
  value?: string;
  name?: string;
  description?: string;
  fileType?: "asset" | "URL" | "layerStyle";
  entityType?: "image" | "file" | "layerStyle";
  sceneId?: string;
  fileFormat?: AcceptedFileFormat;
  onChange?: (value: string | undefined, name: string | undefined) => void;
};

const URLField: React.FC<Props> = ({
  name,
  description,
  value,
  fileType,
  entityType,
  sceneId,
  fileFormat,
  onChange,
}) => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [currentWorkspace] = useWorkspace();
  const [, setNotification] = useNotification();
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = useCallback(
    (inputValue?: string, name?: string) => {
      if (!inputValue) {
        setCurrentValue(inputValue);
        onChange?.(inputValue, name);
      } else if (
        fileType === "asset" &&
        !(checkIfFileType(inputValue, FILE_FORMATS) || checkIfFileType(inputValue, IMAGE_FORMATS))
      ) {
        setNotification({
          type: "error",
          text: t("Wrong file format"),
        });
        setCurrentValue(undefined);
      } else {
        setCurrentValue(inputValue);
        onChange?.(inputValue, name);
      }
    },
    [fileType, onChange, setNotification, t],
  );

  const { handleFileUpload } = useFileUploaderHook({
    workspaceId: currentWorkspace?.id,
    onAssetSelect: handleChange,
    assetType: entityType,
    fileFormat,
  });

  useEffect(() => {
    setCurrentValue(value ?? "");
  }, [value]);

  const handleClick = useCallback(() => setOpen(!open), [open]);
  const handleModalClose = useCallback(() => setOpen(false), []);

  return (
    <Property name={name} description={description}>
      <TextInput value={currentValue} onChange={handleChange} placeholder={t("Not set")} />
      {fileType === "asset" && (
        <ButtonWrapper>
          <SelectionButton
            icon={entityType === "image" ? "imageStoryBlock" : "file"}
            text={t("Choose")}
            iconPosition="left"
            onClick={handleClick}
          />
          <SelectionButton
            icon="uploadSimple"
            text={t("Upload")}
            iconPosition="left"
            onClick={handleFileUpload}
          />
        </ButtonWrapper>
      )}
      {fileType === "layerStyle" && <SelectionButton icon="layerStyle" onClick={handleClick} />}
      {open && entityType !== "layerStyle" && (
        <AssetModal
          open={open}
          onModalClose={handleModalClose}
          assetType={entityType}
          currentWorkspace={currentWorkspace}
          currentValue={currentValue}
          fileFormat={fileFormat}
          onSelect={handleChange}
        />
      )}
      {open && entityType === "layerStyle" && (
        <LayerStyleModal
          open={open}
          sceneId={sceneId}
          onClose={handleModalClose}
          onSelect={handleChange}
        />
      )}
    </Property>
  );
};

const SelectionButton = styled(Button)<{ active?: boolean }>`
  cursor: pointer;
  padding: 4px;
  flex: 1;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: space-between;
  gap: 4px;
`;

export default URLField;
