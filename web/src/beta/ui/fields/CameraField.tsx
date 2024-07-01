import { useCallback, useState, FC } from "react";

import CapturePanel from "@reearth/beta/components/fields/CameraField/CapturePanel";
import EditPanel from "@reearth/beta/components/fields/CameraField/EditPanel";
import { useCurrentCamera } from "@reearth/beta/features/Editor/atoms";
import { Button, ButtonProps, Icon, Typography, Popup } from "@reearth/beta/lib/reearth-ui";
import type { Camera } from "@reearth/beta/utils/value";
import type { FlyTo } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

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
      const dest = c ?? currentCamera;
      if (dest) {
        onFlyTo?.(dest);
      }
    },
    [currentCamera, onFlyTo],
  );

  const handleRemoveSetting = useCallback(() => {
    if (!value) return;
    handleSave();
  }, [value, handleSave]);

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <Popup
        trigger={
          <InputWrapper disabled={disabled}>
            <Input positionSet={!!value}>
              {value && (
                <ZoomToIconWrapper onClick={() => handleFlyto(value)}>
                  <ZoomToIcon icon="capture" size="small" color={theme.content.main} />
                </ZoomToIconWrapper>
              )}
              <StyledText size="footnote" color={value ? theme.content.main : theme.content.weak}>
                {value ? t("Position Set") : t("Not set")}
              </StyledText>
              <DeleteIconWrapper onClick={handleRemoveSetting} disabled={!value}>
                <DeleteIcon icon="trash" size="small" />
              </DeleteIconWrapper>
            </Input>
            <TriggerButton
              appearance="secondary"
              title={t("Edit")}
              icon="pencilSimple"
              size="small"
              onClick={() => handleClick("editor")}
              disabled={disabled}
            />
            <TriggerButton
              appearance="secondary"
              title={t("Capture")}
              icon="camera"
              size="small"
              onClick={() => handleClick("capture")}
              disabled={disabled}
            />
          </InputWrapper>
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
    </CommonField>
  );
};

const InputWrapper = styled("div")<{ disabled?: boolean }>(({ theme, disabled }) => ({
  display: "flex",
  gap: theme.spacing.small,
  flexWrap: "wrap",
  opacity: disabled ? 0.6 : 1,
}));

const Input = styled("div")<{ positionSet?: boolean }>(({ theme, positionSet }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.smallest,
  flex: 1,
  padding: "0 8px",
  height: "28px",
  width: "120px",
  borderRadius: "4px",
  border: `1px solid ${theme.outline.weak}`,
  color: positionSet ? theme.content.main : theme.content.weak,
  background: theme.bg[1],
  boxShadow: theme.shadow.input,
}));

const StyledText = styled(Typography)({
  whiteSpace: "nowrap",
});

const TriggerButton = styled(Button)({
  height: "28px",
  margin: "0",
});

const ZoomToIconWrapper = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ZoomToIcon = styled(Icon)({
  ":hover": {
    cursor: "pointer",
  },
});

const DeleteIconWrapper = styled("div")<{ disabled?: boolean }>(({ disabled }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: disabled ? "not-allowed" : "pointer",
}));

const DeleteIcon = styled(Icon)``;
export default CameraField;
