import { useCallback, useState, FC } from "react";

import CapturePanel from "@reearth/beta/components/fields/CameraField/CapturePanel";
import EditPanel from "@reearth/beta/components/fields/CameraField/EditPanel";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { useCurrentCamera } from "@reearth/beta/features/Editor/atoms";
import { Button, ButtonProps } from "@reearth/beta/lib/reearth-ui";
import type { Camera } from "@reearth/beta/utils/value";
import type { FlyTo } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

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
      <Popover.Provider open={!!open} placement="bottom-start">
        <Popover.Trigger asChild>
          <InputWrapper disabled={disabled}>
            <Input positionSet={!!value}>
              {value && (
                <ZoomToIcon icon="zoomToLayer" size={10} onClick={() => handleFlyto(value)} />
              )}
              <StyledText size="footnote" customColor>
                {value ? t("Position Set") : t("Not set")}
              </StyledText>
              <DeleteIcon icon="bin" size={10} disabled={!value} onClick={handleRemoveSetting} />
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
  gap: 10px;

  flex-wrap: wrap;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const Input = styled.div<{ positionSet?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  flex: 1;
  padding: 0 8px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  color: ${({ theme }) => theme.content.main};
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: ${({ theme }) => theme.shadow.input};

  color: ${({ theme, positionSet }) => (positionSet ? theme.content.main : theme.content.weak)};
`;

const StyledText = styled(Text)`
  white-space: nowrap;
`;

const TriggerButton = styled(Button)`
  height: 28px;
  margin: 0;
`;

const ZoomToIcon = styled(Icon)`
  :hover {
    cursor: pointer;
  }
`;

const DeleteIcon = styled(Icon)<{ disabled?: boolean }>`
  ${({ disabled, theme }) =>
    disabled
      ? `color: ${theme.content.weaker};`
      : `:hover {
    cursor: pointer;
      }`}
`;

export default CameraField;
