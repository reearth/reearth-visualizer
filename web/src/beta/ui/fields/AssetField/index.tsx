import AssetsSelector from "@reearth/beta/features/AssetsManager/AssetsSelector";
import {
  AcceptedAssetsTypes,
  type FileType,
  GIS_FILE_TYPES,
  IMAGE_FILE_TYPES,
  MODEL_FILE_TYPES
} from "@reearth/beta/features/AssetsManager/constants";
import {
  TextInput,
  Button,
  TextInputProps
} from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { useT } from "@reearth/services/i18n";
import {
  useNotification,
  useProjectId,
  useWorkspace
} from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useState } from "react";

import useAssetUpload from "./useAssetUpload";

export type AssetFieldProps = CommonFieldProps & {
  value?: string;
  inputMethod?: "asset" | "URL";
  assetsTypes?: AcceptedAssetsTypes;
  placeholder?: string;
  onChange?: (value: string | undefined, name: string | undefined) => void;
  onInputChange?: (value?: string) => void;
} & Pick<TextInputProps, "disabled" | "appearance">;

const AssetField: FC<AssetFieldProps> = ({
  title,
  description,
  value,
  inputMethod,
  assetsTypes,
  placeholder,
  disabled,
  appearance,
  onChange,
  onInputChange
}) => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [currentWorkspace] = useWorkspace();
  const [currentProjectId] = useProjectId();
  const [, setNotification] = useNotification();
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = useCallback(
    (url?: string, name?: string) => {
      if (!url && url !== value) {
        onChange?.(url, name);
        return;
      }

      const extension = (url?.split(".").pop() ?? "").toLowerCase();
      const acceptedTypes = [
        ...IMAGE_FILE_TYPES,
        ...GIS_FILE_TYPES,
        ...MODEL_FILE_TYPES
      ];

      if (
        inputMethod === "asset" &&
        !acceptedTypes.includes(extension as FileType)
      ) {
        setNotification({
          type: "error",
          text: t("Wrong file format")
        });
        setCurrentValue(undefined);
      } else {
        if (url !== value) {
          onChange?.(url, name);
        }
      }
    },
    [inputMethod, onChange, setNotification, t, value]
  );

  const handleInputChange = useCallback(
    (url?: string) => {
      setCurrentValue(url);
      onInputChange?.(url);
    },
    [onInputChange]
  );

  const { handleFileUpload } = useAssetUpload({
    workspaceId: currentWorkspace?.id,
    projectId: currentProjectId,
    onAssetSelect: handleChange,
    assetsTypes,
    multiple: false
  });

  useEffect(() => {
    setCurrentValue(value ?? "");
  }, [value]);

  const handleClick = useCallback(() => setOpen(!open), [open]);
  const handleModalClose = useCallback(() => setOpen(false), []);

  return (
    <CommonField
      title={title}
      description={description}
      data-testid="assetfield-commonfield"
    >
      <AssetWrapper data-testid="assetfield-wrapper">
        <TextInput
          value={currentValue}
          onBlur={handleChange}
          disabled={disabled}
          appearance={appearance}
          placeholder={placeholder ?? t("Not set")}
          onChange={handleInputChange}
          data-testid="assetfield-input"
        />
        {inputMethod === "asset" && (
          <ButtonWrapper data-testid="assetfield-buttonwrapper">
            <Button
              icon={"image"}
              size="small"
              title={t("Choose")}
              onClick={handleClick}
              disabled={disabled}
              extendWidth
              data-testid="assetfield-choose-btn"
            />
            <Button
              icon={"uploadSimple"}
              size="small"
              title={t("Upload")}
              disabled={disabled}
              onClick={handleFileUpload}
              extendWidth
              data-testid="assetfield-upload-btn"
            />
          </ButtonWrapper>
        )}
      </AssetWrapper>
      {open && (
        <AssetsSelector
          opened={open}
          onClose={handleModalClose}
          workspaceId={currentWorkspace?.id}
          projectId={currentProjectId}
          onAssetSelect={handleChange}
          assetsTypes={assetsTypes}
          data-testid="assetfield-assetsselector"
        />
      )}
    </CommonField>
  );
};

export default AssetField;

const AssetWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.smallest}px`,
  width: "100%"
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: `${theme.spacing.smallest}px`
}));
