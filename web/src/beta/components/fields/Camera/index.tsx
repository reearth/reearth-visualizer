import React from "react";

import Button from "@reearth/beta/components/Button";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import Property from "..";

import useHooks from "./hooks";

// Constants
const fields = ["1", "2", "3"];

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
  onChange?: (value: string) => void;
};

// Component
const ColorField: React.FC<Props> = ({ name, description, value, onChange }) => {
  const t = useT();
  const theme = useTheme();
  const { colorState, open, handleClose, handleSave, handleClick } = useHooks({
    value,
    onChange,
  });
  // Notes:
  // What's fov number?
  // from classic component, do we need to implement all the hooks as well?
  // src/classic/components/molecules/EarthEditor/PropertyPane/PropertyField/CameraField/hooks.ts ?

  return (
    <Property name={name} description={description}>
      <Popover.Provider open={open} placement="bottom-start" onOpenChange={handleClick}>
        <Popover.Trigger asChild>
          <InputWrapper>
            <Input
              value={colorState && t("Position Set")}
              placeholder={t("Not Set")}
              disabled={true}
            />
            <CaptureButton
              buttonType="secondary"
              text="Capture"
              icon="cameraButtonStoryBlock"
              size="medium"
              iconPosition="left"
              onClick={handleClick}
            />
          </InputWrapper>
        </Popover.Trigger>
        <PickerWrapper>
          <HeaderWrapper>
            <PickerTitle size="footnote" weight="regular" color={theme.content.main}>
              Color Pose Setting
            </PickerTitle>
            {handleClose && <CloseIcon icon="cancel" size={12} onClick={handleClose} />}
          </HeaderWrapper>
          <MainBodyWrapper>
            <ValueInputWrapper>
              {/* TODO: Need translation for the text below */}
              <Text size="footnote">Position</Text>
              <ValuesWrapper>
                {fields.map(channel => (
                  <>
                    <InputValue key={channel} name={channel} type="number" placeholder="-" />
                    {/* TODO: Need to add labels */}
                    {/* <label>Label for key</label> */}
                  </>
                ))}
              </ValuesWrapper>
            </ValueInputWrapper>
            <ValueInputWrapper>
              {/* TODO: Need translation for the text below */}
              <Text size="footnote">Rotation</Text>
              <ValuesWrapper>
                {fields.map(channel => (
                  <InputValue key={channel} name={channel} type="number" placeholder="-" />
                ))}
              </ValuesWrapper>
            </ValueInputWrapper>
          </MainBodyWrapper>
          <FormButtonGroup>
            <ButtonWrapper
              buttonType="secondary"
              text={t("Clean Capture")}
              onClick={handleClose}
              size="medium"
            />
            <ButtonWrapper
              buttonType="primary"
              text={t("Capture")}
              onClick={handleSave}
              size="medium"
            />
            {/* TODO: Add Jump to Selection Button */}
          </FormButtonGroup>
        </PickerWrapper>
      </Popover.Provider>
    </Property>
  );
};

const InputWrapper = styled.div`
  display: flex;
  gap: 10px;
`;

const Input = styled.input<{ type?: string }>`
  display: flex;
  padding: 4px 8px;
  border-radius: 4px;
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
  height: 252px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
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
  padding-top: 8px;
  padding-bottom: 8px;
`;

const InputValue = styled(Input)`
  width: 30%;
  -webkit-appearance: none;
  -moz-appearance: textfield;
  &:focus-visible {
    border-color: ${({ theme }) => theme.outline.main};
    outline: none;
  }
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
  min-width: 135px;
  padding: 0px;
  margin: 0px;
`;

export default ColorField;
