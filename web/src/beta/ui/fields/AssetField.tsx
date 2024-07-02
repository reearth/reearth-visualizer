import { FC, useCallback, useEffect, useState } from "react";

import { FILE_FORMATS, IMAGE_FORMATS } from "@reearth/beta/features/Assets/constants";
import { AcceptedFileFormat } from "@reearth/beta/features/Assets/types";
import AssetModal from "@reearth/beta/features/Modals/AssetModal";
import LayerStyleModal from "@reearth/beta/features/Modals/LayerStyleModal";
import useFileUploaderHook from "@reearth/beta/hooks/useAssetUploader/hooks";
import { TextInput, TextInputProps, Button, ButtonProps } from "@reearth/beta/lib/reearth-ui";
import { checkIfFileType } from "@reearth/beta/utils/util";
import { useT } from "@reearth/services/i18n";
import { useNotification, useWorkspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type AssetFieldProps = CommonFieldProps &
  ButtonProps &
  TextInputProps & {
    entityType?: "image" | "file" | "layerStyle";
    fileType?: "asset" | "URL" | "layerStyle";
    fileFormat?: AcceptedFileFormat;
    sceneId?: string;
    onChange?: (value: string | undefined, name: string | undefined) => void;
    maxWidth?: number;
  };

const AssetField: FC<AssetFieldProps> = ({
  commonTitle,
  description,
  appearance,
  disabled,
  iconButton,
  value,
  placeholder,
  onChange,
  extendWidth,
  entityType,
  fileType,
  fileFormat,
  sceneId,
  maxWidth,
  size,
  minWidth,
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
      <AssetWrapper maxWidth={maxWidth}>
        <TextInput
          value={currentValue}
          onChange={handleChange}
          extendWidth={extendWidth}
          placeholder={placeholder ?? t("Not set")}
        />
        {fileType === "asset" && (
          <ButtonWrapper>
            <SelectionButton
              appearance={appearance}
              icon={"image"}
              size={size}
              disabled={disabled}
              iconButton={iconButton}
              title="Choose"
              onClick={handleClick}
              minWidth={minWidth}
            />
            <SelectionButton
              appearance={appearance}
              icon={"uploadSimple"}
              size={size}
              disabled={disabled}
              iconButton={iconButton}
              title="Upload"
              onClick={handleFileUpload}
              minWidth={minWidth}
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

const AssetWrapper = styled("div")<{
  maxWidth?: number;
}>(({ theme, maxWidth }) => ({
  display: "flex",
  flexDirection: "column",
  maxWidth: `${maxWidth}px`,
  gap: `${theme.spacing.smallest}px`,
  width: "100%",
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: `${theme.spacing.smallest}px`,
}));

const SelectionButton = styled(Button)`
  cursor: pointer;
`;
