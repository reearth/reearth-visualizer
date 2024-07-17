import { FC, useCallback, useEffect, useState } from "react";

import { FILE_FORMATS, IMAGE_FORMATS } from "@reearth/beta/features/Assets/constants";
import { AcceptedFileFormat } from "@reearth/beta/features/Assets/types";
import AssetModal from "@reearth/beta/features/Modals/AssetModal";
import LayerStyleModal from "@reearth/beta/features/Modals/LayerStyleModal";
import useFileUploaderHook from "@reearth/beta/hooks/useAssetUploader/hooks";
import { TextInput, Button } from "@reearth/beta/lib/reearth-ui";
import { checkIfFileType } from "@reearth/beta/utils/util";
import { useT } from "@reearth/services/i18n";
import { useNotification, useWorkspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type AssetFieldProps = CommonFieldProps & {
  value?: string;
  fileType?: "asset" | "URL" | "layerStyle";
  entityType?: "image" | "file" | "layerStyle";
  fileFormat?: AcceptedFileFormat;
  sceneId?: string;
  placeholder?: string;
  onChange?: (value: string | undefined, name: string | undefined) => void;
};

const AssetField: FC<AssetFieldProps> = ({
  commonTitle,
  description,
  value,
  entityType,
  fileType,
  fileFormat,
  sceneId,
  placeholder,
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
    <CommonField commonTitle={commonTitle} description={description}>
      <AssetWrapper>
        <TextInput
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder ?? t("Not set")}
        />
        {fileType === "asset" && (
          <ButtonWrapper>
            <Button icon={"image"} size="small" title="Choose" onClick={handleClick} extendWidth />
            <Button
              icon={"uploadSimple"}
              size="small"
              title="Upload"
              onClick={handleFileUpload}
              extendWidth
            />
          </ButtonWrapper>
        )}
      </AssetWrapper>
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
    </CommonField>
  );
};

export default AssetField;

const AssetWrapper = styled("div")<{}>(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.smallest}px`,
  width: "100%",
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: `${theme.spacing.smallest}px`,
}));
