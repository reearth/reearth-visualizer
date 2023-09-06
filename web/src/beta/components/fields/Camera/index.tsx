import { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import NumberInput from "@reearth/beta/components/fields/common/NumberInput";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import Property from "..";

type CameraInput = {
  name: string;
  field: keyof CameraValue;
};
// Constants
const CAMERA_XYZ: CameraInput[] = [
  {
    name: "Latitude",
    field: "lat",
  },
  {
    name: "Longitude",
    field: "lng",
  },
  {
    name: "Height",
    field: "height",
  },
];

const CAMERA_ANGLE: CameraInput[] = [
  {
    name: "Heading",
    field: "heading",
  },
  {
    name: "Pitch",
    field: "pitch",
  },
  {
    name: "Roll",
    field: "roll",
  },
];

export type CameraValue = {
  lat: number;
  lng: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
  fov: number;
};

export type Props = {
  name?: string;
  description?: string;
  value?: CameraValue;
  disabled?: boolean;
  onCapture: () => void;
  onJump?: (input: CameraValue) => void;
  onClean: () => void;
};

// Component
const ColorField: React.FC<Props> = ({
  name,
  description,
  value,
  disabled,
  onCapture,
  onJump,
  onClean,
}) => {
  const t = useT();
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  const handleJump = useCallback(() => {
    if (!value) return;
    onJump(value);
  }, [value, onJump]);

  //Actions
  const handleClean = useCallback(() => {
    onClean();
    setOpen(false);
  }, [onClean]);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleSave = useCallback(() => {
    onCapture();
    setOpen(false);
  }, [onCapture]);

  //events
  const handleClick = useCallback(() => setOpen(!open), [open]);

  // Notes:
  // from classic component, do we need to implement all the hooks as well?
  // src/classic/components/molecules/EarthEditor/PropertyPane/PropertyField/CameraField/hooks.ts ?

  return (
    <Property name={name} description={description}>
      <Popover.Provider open={open} placement="bottom-start" onOpenChange={handleClick}>
        <Popover.Trigger asChild>
          <InputWrapper disabled={disabled}>
            <Input
              value={value ? t("Camera Set") : ""}
              placeholder={t("Not Set")}
              disabled={true}
            />
            <CaptureButton
              buttonType="secondary"
              text={t("Capture")}
              icon="cameraButtonStoryBlock"
              size="small"
              iconPosition="left"
              onClick={handleClick}
              disabled={disabled}
            />
          </InputWrapper>
        </Popover.Trigger>
        <PickerWrapper>
          <HeaderWrapper>
            <PickerTitle size="footnote" weight="regular" color={theme.content.main}>
              {t("Camera Pose Setting")}
            </PickerTitle>
            <CloseIcon icon="cancel" size={12} onClick={handleClose} />
          </HeaderWrapper>
          <MainBodyWrapper>
            <ValueInputWrapper>
              <Text size="footnote">{t("Position")}</Text>
              <ValuesWrapper>
                {CAMERA_XYZ.map(({ name, field }) => (
                  <NumberInput key={field} placeholder="-" inputDescription={name} />
                ))}
              </ValuesWrapper>
            </ValueInputWrapper>
            <ValueInputWrapper>
              <Text size="footnote">{t("Rotation")}</Text>
              <ValuesWrapper>
                {CAMERA_ANGLE.map(({ name, field }) => (
                  <NumberInput key={field} placeholder="-" inputDescription={name} />
                ))}
              </ValuesWrapper>
            </ValueInputWrapper>
            {/* TODO: Add FOV field */}
          </MainBodyWrapper>
          <FormButtonGroup>
            <ButtonWrapper
              buttonType="secondary"
              text={t("Jump")}
              onClick={handleJump}
              size="medium"
              disabled={!value}
            />
          </FormButtonGroup>
          <FormButtonGroup>
            <ButtonWrapper
              buttonType="secondary"
              text={t("Clean Capture")}
              onClick={handleClean}
              size="medium"
              disabled={!value}
            />
            <ButtonWrapper
              buttonType="primary"
              text={t("Capture")}
              onClick={handleSave}
              size="medium"
            />
          </FormButtonGroup>
        </PickerWrapper>
      </Popover.Provider>
    </Property>
  );
};

const InputWrapper = styled.div<{ disabled?: boolean }>`
  display: flex;
  gap: 10px;
  height: 28px;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const Input = styled.input<{ disabled?: boolean }>`
  display: flex;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  color: ${({ theme }) => theme.content.main};
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "inherit")};
`;

const CaptureButton = styled(Button)`
  margin: 0;
  background: ${({ theme }) => theme.bg[1]};
`;

const PickerWrapper = styled(Popover.Content)`
  width: 286px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const HeaderWrapper = styled.div`
  display: flex;
  padding: 4px 8px;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  height: 28px;
  border-bottom: 1px solid ${({ theme }) => theme.outline.weak};
`;

const PickerTitle = styled(Text)`
  text-align: center;
  margin-right: auto;
`;

const CloseIcon = styled(Icon)`
  margin-left: auto;
  cursor: pointer;
`;

const MainBodyWrapper = styled.div`
  display: flex;
  padding: 0 8px;
  flex-direction: column;
  height: 100%;
  justify-content: space-evenly;
`;

const ValueInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
  margin-top: 8px;
`;

const ValuesWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 4px;
  padding-bottom: 4px;
  width: 100%;
`;

const FormButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  height: 28px;
  justify-content: center;
  border-top: 1px solid ${({ theme }) => theme.bg[3]};
  padding: 8px;
  gap: 8px;
`;

const ButtonWrapper = styled(Button)`
  height: 27px;
  width: 100%;
  padding: 0px;
  margin: 0px;
`;

export default ColorField;
