import { useCallback, useState, useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import NumberInput from "@reearth/beta/components/fields/common/NumberInput";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
// import Slider from "@reearth/beta/components/Slider";
import Text from "@reearth/beta/components/Text";
import { FlyTo } from "@reearth/beta/lib/core/types";
import { Camera } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import Property from "..";

type CameraInput = {
  name: string;
  field: keyof Camera;
};

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
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const [newCamera, setNewCamera] = useState<Camera | undefined>(currentCamera ?? value);

  const handleJump = useCallback(() => {
    if (!value || !newCamera || value === newCamera) return;
    onFlyTo?.(newCamera);
  }, [value, newCamera, onFlyTo]);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleClick = useCallback(() => setOpen(!open), [open]);

  const handleFieldUpdate = useCallback(
    (key: keyof Camera, update?: number) => {
      if (!update || !value) return;
      const updated: Camera = {
        ...value,
        [key]: update,
      };
      setNewCamera(updated);
    },
    [value],
  );

  const {
    cameraAngleInput,
    cameraXYZInput,
  }: { cameraAngleInput: CameraInput[]; cameraXYZInput: CameraInput[] } = useMemo(
    () => ({
      cameraXYZInput: [
        {
          name: t("Latitude"),
          field: "lat",
        },
        {
          name: t("Longitude"),
          field: "lng",
        },
        {
          name: t("Altitude"),
          field: "height",
        },
      ],
      cameraAngleInput: [
        {
          name: t("Heading"),
          field: "heading",
        },
        {
          name: t("Pitch"),
          field: "pitch",
        },
        {
          name: t("Roll"),
          field: "roll",
        },
      ],
    }),
    [t],
  );

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
                {cameraXYZInput.map(({ name, field }) => (
                  <NumberInput
                    key={field}
                    placeholder="-"
                    inputDescription={name}
                    defaultValue={currentCamera?.[field]}
                    value={newCamera?.[field]}
                    onChange={x => handleFieldUpdate(field, x)}
                  />
                ))}
              </ValuesWrapper>
            </ValueInputWrapper>
            <ValueInputWrapper>
              <Text size="footnote">{t("Rotation")}</Text>
              <ValuesWrapper>
                {cameraAngleInput.map(({ name, field }) => (
                  <NumberInput
                    key={field}
                    placeholder="-"
                    inputDescription={name}
                    defaultValue={currentCamera?.[field]}
                    value={newCamera?.[field]}
                    onChange={x => handleFieldUpdate(field, x)}
                  />
                ))}
              </ValuesWrapper>
            </ValueInputWrapper>
            {/* <ValueInputWrapper>
              <Text size="footnote">{t("Angle")}</Text>
              <Slider
                defaultValue={currentCamera?.["fov"]}
                value={newCamera?.["fov"]}
                min={0}
                max={180}
                onChange={x => handleFieldUpdate("fov", x)}
              />
            </ValueInputWrapper> */}
          </MainBodyWrapper>
          <FormButtonGroup>
            <JumpButton
              buttonType="secondary"
              text={t("Jump")}
              onClick={handleJump}
              // disabled={!value}
            />
            <StyledButton
              buttonType="secondary"
              text={t("Clean Capture")}
              onClick={() => onSave()}
              disabled={!value}
            />
            <StyledButton
              buttonType="primary"
              text={t("Capture")}
              onClick={() => onSave(newCamera)}
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

const Input = styled.input`
  width: 100%;
  display: flex;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  color: ${({ theme }) => theme.content.main};
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset;
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
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 4px 8px;
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
  padding: 8px;
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
  justify-content: center;
  flex-wrap: wrap;
  border-top: 1px solid ${({ theme }) => theme.bg[3]};
  padding: 8px;
  gap: 8px;
`;

const StyledButton = styled(Button)`
  height: 28px;
  margin: 0;
  flex: 1;
`;

const JumpButton = styled(StyledButton)`
  flex: 0 0 100%;
`;

export default CameraField;
