import AssetsSelector from "@reearth/beta/features/AssetsManager/AssetsSelector";
import {
  AcceptedAssetsTypes,
  type FileType,
  GIS_FILE_TYPES,
  IMAGE_FILE_TYPES
} from "@reearth/beta/features/AssetsManager/constants";
import { TextInput, Button } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { useNotification, useWorkspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useState } from "react";

import CommonField, { CommonFieldProps } from "../CommonField";

import useAssetUpload from "./useAssetUpload";

export type AssetFieldProps = CommonFieldProps & {
  value?: string;
  inputMethod?: "asset" | "URL";
  assetsTypes?: AcceptedAssetsTypes;
  placeholder?: string;
  onChange?: (value: string | undefined, name: string | undefined) => void;
};

const AssetField: FC<AssetFieldProps> = ({
  title,
  description,
  value,
  inputMethod,
  assetsTypes,
  placeholder,
  onChange
}) => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [currentWorkspace] = useWorkspace();
  const [, setNotification] = useNotification();
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = useCallback(
    (url?: string, name?: string) => {
      if (!url) {
        setCurrentValue(url);
        onChange?.(url, name);
      } else if (
        inputMethod === "asset" &&
        ![...IMAGE_FILE_TYPES, ...GIS_FILE_TYPES].includes(
          (url.split(".").pop() as FileType) ?? ""
        )
      ) {
        setNotification({
          type: "error",
          text: t("Wrong file format")
        });
        setCurrentValue(undefined);
      } else {
        setCurrentValue(url);
        onChange?.(url, name);
      }
    },
    [inputMethod, onChange, setNotification, t]
  );

  const { handleFileUpload } = useAssetUpload({
    workspaceId: currentWorkspace?.id,
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
    <CommonField title={title} description={description}>
      <AssetWrapper>
        <TextInput
          value={currentValue}
          onBlur={handleChange}
          placeholder={placeholder ?? t("Not set")}
        />
        {inputMethod === "asset" && (
          <ButtonWrapper>
            <Button
              icon={"image"}
              size="small"
              title="Choose"
              onClick={handleClick}
              extendWidth
            />
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
      {open && (
        <AssetsSelector
          opened={open}
          onClose={handleModalClose}
          workspaceId={currentWorkspace?.id}
          onAssetSelect={handleChange}
          assetsTypes={assetsTypes}
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
