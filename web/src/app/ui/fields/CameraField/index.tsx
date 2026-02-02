import { useCurrentCamera } from "@reearth/app/features/Editor/atoms";
import {
  Button,
  ButtonProps,
  Popup,
  TextInput
} from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import type { Camera } from "@reearth/app/utils/value";
import type { FlyTo } from "@reearth/core";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { useCallback, useState, FC } from "react";

import CapturePanel from "./CapturePanel";
import EditPanel from "./EditorPanel";

export type PanelProps = {
  camera?: Camera;
  withFOV?: boolean;
  onSave: (value?: Camera) => void;
  onFlyTo?: (camera?: Camera) => void;
  onClose: () => void;
};

export type CameraFieldProps = CommonFieldProps &
  ButtonProps & {
    description?: string;
    value?: Camera;
    disabled?: boolean;
    withFOV?: boolean;
    onSave: (value?: Camera) => void;
    onFlyTo?: FlyTo;
  };

const CameraField: FC<CameraFieldProps> = ({
  description,
  value,
  disabled,
  withFOV,
  title,
  onSave,
  onFlyTo
}) => {
  const theme = useTheme();
  const t = useT();
  const [open, setOpen] = useState<"editor" | "capture" | null>(null);
  const [currentCamera] = useCurrentCamera();

  const handleClick = useCallback(
    (panel: "editor" | "capture") =>
      setOpen((current) => (current === panel ? null : panel)),
    []
  );

  const handleClose = useCallback(() => setOpen(null), []);

  const handleSave = useCallback(
    (value?: Camera) => {
      onSave(value);
      setOpen(null);
    },
    [onSave]
  );

  const handleFlyto = useCallback(
    (c?: Partial<Camera>) => {
      const dest = c ?? currentCamera;
      if (dest) {
        onFlyTo?.(dest);
      }
    },
    [currentCamera, onFlyTo]
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

  return (
    <CommonField
      title={title}
      description={description}
      data-testid="camerafield-commonfield"
    >
      <InputWrapper data-testid="camerafield-inputwrapper">
        <TextInput
          value={value && t("Position Set")}
          placeholder={t("Not set")}
          appearance="readonly"
          disabled
          leftAction={value && [ZoomToPosition]}
          actions={[
            <Button
              key="delete"
              icon="trash"
              size="small"
              iconButton
              appearance="simple"
              disabled={!value}
              onClick={handleCameraSettingDelete}
              iconColor={value ? theme.content.main : theme.content.weak}
              data-testid="camerafield-delete-btn"
            />
          ]}
          data-testid="camerafield-input"
        />
        <Popup
          trigger={
            <Button
              appearance="secondary"
              title={t("Edit")}
              icon="pencilSimple"
              size="small"
              onClick={() => handleClick("editor")}
              disabled={disabled}
              data-testid="camerafield-edit-btn"
            />
          }
          open={open === "editor"}
          offset={4}
          placement="bottom-start"
          data-testid="camerafield-edit-popup"
        >
          {open === "editor" && (
            <EditPanel
              camera={value}
              withFOV={withFOV}
              onSave={handleSave}
              onFlyTo={handleFlyto}
              onClose={handleClose}
              data-testid="camerafield-editpanel"
            />
          )}
        </Popup>
        <Popup
          trigger={
            <Button
              appearance="secondary"
              title={t("Capture")}
              icon="camera"
              size="small"
              onClick={() => handleClick("capture")}
              disabled={disabled}
              data-testid="camerafield-capture-btn"
            />
          }
          open={open === "capture"}
          offset={4}
          placement="bottom-start"
          data-testid="camerafield-capture-popup"
        >
          {open === "capture" && (
            <CapturePanel
              camera={currentCamera}
              withFOV={withFOV}
              onSave={handleSave}
              onClose={handleClose}
              onFlyTo={handleFlyto}
              data-testid="camerafield-capturepanel"
            />
          )}
        </Popup>
      </InputWrapper>
    </CommonField>
  );
};

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  flexWrap: "wrap",
  width: "100%"
}));

export default CameraField;
