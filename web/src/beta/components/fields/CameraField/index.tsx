import { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
// import Slider from "@reearth/beta/components/Slider";
import type { FlyTo } from "@reearth/beta/lib/core/types";
import type { Camera } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Property from "..";

import CapturePanel from "./CapturePanel";
import EditPanel from "./EditPanel";

type Panel = "editor" | "capture" | undefined;

export type Props = {
  name?: string;
  description?: string;
  value?: Camera;
  disabled?: boolean;
  currentCamera?: Camera;
  onSave: (value?: Camera) => void;
  onFlyTo?: FlyTo;
};

const CameraField: React.FC<Props> = ({
  name,
  description,
  value,
  disabled,
  currentCamera,
  onSave,
  onFlyTo,
}) => {
  const t = useT();
  const [open, setOpen] = useState<Panel>(undefined);

  const handleClose = useCallback(() => setOpen(undefined), []);

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
    <Property name={name} description={description}>
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
              buttonType="secondary"
              text={t("Edit")}
              icon="pencilSimple"
              size="small"
              iconPosition="left"
              onClick={() => handleClick("editor")}
              disabled={disabled}
            />
            <TriggerButton
              buttonType="secondary"
              text={t("Capture")}
              icon="cameraButtonStoryBlock"
              size="small"
              iconPosition="left"
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
    </Property>
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
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset;

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
