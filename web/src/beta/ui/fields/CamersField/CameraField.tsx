import { useCallback, useState, FC } from "react";

import CapturePanel from "@reearth/beta/components/fields/CameraField/CapturePanel";
import EditPanel from "@reearth/beta/components/fields/CameraField/EditPanel";
import { useCurrentCamera } from "@reearth/beta/features/Editor/atoms";
import { Button, ButtonProps, Popup, TextInput } from "@reearth/beta/lib/reearth-ui";
import type { Camera } from "@reearth/beta/utils/value";
import type { FlyTo } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "../CommonField";

type Panel = "editor" | "capture" | undefined;

export type CameraFieldProps = CommonFieldProps &
  ButtonProps & {
    name?: string;
    description?: string;
    value?: Camera;
    disabled?: boolean;
    onSave: (value?: Camera) => void;
    onFlyTo?: FlyTo;
  };

const CameraField: FC<CameraFieldProps> = ({
  description,
  value,
  disabled,
  onSave,
  onFlyTo,
  commonTitle,
}) => {
  const theme = useTheme();
  const t = useT();
  const [open, setOpen] = useState<Panel>(undefined);
  const handleClose = useCallback(() => setOpen(undefined), []);

  const [currentCamera] = useCurrentCamera();

  const handleClick = useCallback(
    (panel: Panel) => setOpen(current => (current === panel ? undefined : panel)),
    [],
  );

  const handleSave = useCallback(
    (value?: Camera) => {
      onSave(value);
      setOpen(undefined);
    },
    [onSave],
  );

  const handleFlyto = useCallback(
    (c?: Partial<Camera>) => {
      if (!value) return;
      const dest = c ?? currentCamera;
      if (dest) {
        onFlyTo?.(dest);
      }
    },
    [currentCamera, onFlyTo, value],
  );

  const handleCameraSettingDelete = useCallback(() => {
    if (!value) return;
    handleSave();
  }, [value, handleSave]);

  const ZoomToPosition: FC = () => (
    <Button
      icon="capture"
      size="small"
      iconButton
      appearance="simple"
      disabled={!value}
      onClick={() => handleFlyto(value)}
      iconColor={value ? theme.content.main : theme.content.weak}
    />
  );
  const DelectAction: FC = () => (
    <Button
      icon="trash"
      size="small"
      iconButton
      appearance="simple"
      disabled={!value}
      onClick={handleCameraSettingDelete}
      iconColor={value ? theme.content.main : theme.content.weak}
    />
  );

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <InputWrapper>
        <TextInput
          value={value && t("Position Set")}
          placeholder={t("Not set")}
          disabled
          leftAction={[ZoomToPosition]}
          actions={[DelectAction]}
        />
        <Popup
          trigger={
            <ButtonWrapper>
              <Button
                appearance="secondary"
                title={t("Edit")}
                icon="pencilSimple"
                size="small"
                onClick={() => handleClick("editor")}
                disabled={disabled}
              />
              <Button
                appearance="secondary"
                title={t("Capture")}
                icon="camera"
                size="small"
                onClick={() => handleClick("capture")}
                disabled={disabled}
              />
            </ButtonWrapper>
          }
          open={open !== undefined}
          onOpenChange={isOpen => {
            if (!isOpen) {
              setOpen(undefined);
            }
          }}
          placement="bottom-start">
          {open === "capture" ? (
            <CapturePanel camera={currentCamera} onSave={handleSave} onClose={handleClose} />
          ) : open === "editor" ? (
            <EditPanel
              camera={value}
              onSave={handleSave}
              onFlyTo={handleFlyto}
              onClose={handleClose}
            />
          ) : null}
        </Popup>
      </InputWrapper>
    </CommonField>
  );
};

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  flexWrap: "wrap",
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
}));

export default CameraField;
