import { useCallback, useState, FC } from "react";

import CapturePanel from "@reearth/beta/components/fields/CameraField/CapturePanel";
import EditPanel from "@reearth/beta/components/fields/CameraField/EditPanel";
import * as Popover from "@reearth/beta/components/Popover";
import { useCurrentCamera } from "@reearth/beta/features/Editor/atoms";
import { Button, ButtonProps, TextInput, TextInputProps } from "@reearth/beta/lib/reearth-ui";
// import Slider from "@reearth/beta/components/Slider";
import type { Camera } from "@reearth/beta/utils/value";
import type { FlyTo } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

type Panel = "editor" | "capture" | undefined;

export type CameraFieldProps = CommonFieldProps &
  ButtonProps &
  TextInputProps & {
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
  extendWidth,
  placeholder,
  actions,
}) => {
  const t = useT();
  const [open, setOpen] = useState<Panel>(undefined);
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = () => {
    console.log("value", setCurrentValue(value));
  };

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

  // const handleRemoveSetting = useCallback(() => {
  //   if (!value) return;
  //   handleSave();
  // }, [value, handleSave]);

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <Popover.Provider open={!!open} placement="bottom-start">
        <Popover.Trigger asChild>
          <InputWrapper disabled={disabled}>
            <TextInput
              value={currentValue}
              onChange={handleChange}
              extendWidth={extendWidth}
              placeholder={placeholder ?? t("Not set")}
              actions={actions}
            />
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
        </Popover.Trigger>
        <Popover.Content autoFocus={false}>
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
        </Popover.Content>
      </Popover.Provider>
    </CommonField>
  );
};

const InputWrapper = styled.div<{ disabled?: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing.smallest}px;

  flex-wrap: wrap;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const TriggerButton = styled(Button)`
  height: 28px;
  margin: 0;
`;

export default CameraField;
