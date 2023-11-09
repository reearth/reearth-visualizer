import React from "react";
import { RgbaColorPicker } from "react-colorful";

import Button from "@reearth/beta/components/Button";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled, css, useTheme } from "@reearth/services/theme";

import Property from "..";

import useHooks from "./hooks";
import { Props, RGBA } from "./types";

const channels = ["r", "g", "b", "a"];
const hexPlaceholder = "#RRGGBBAA";

const ColorField: React.FC<Props> = ({ name, description, value, onChange, className }) => {
  const t = useT();
  const theme = useTheme();
  const {
    wrapperRef,
    pickerRef,
    colorState,
    open,
    rgba,
    getChannelValue,
    handleClose,
    handleSave,
    handleHexSave,
    handleChange,
    handleRgbaInput,
    handleHexInput,
    handleClick,
    handleKeyPress,
  } = useHooks({ value, onChange });

  return (
    <Property name={name} description={description} className={className}>
      <Wrapper ref={wrapperRef}>
        <Popover.Provider open={open} placement="bottom-start">
          <Popover.Trigger asChild>
            <InputWrapper ref={pickerRef}>
              <Layers onClick={handleClick}>
                <CheckedPattern />
                <Swatch c={colorState || "transparent"} />
              </Layers>
              <Input
                value={colorState || ""}
                placeholder={hexPlaceholder}
                onChange={handleHexInput}
                onKeyPress={handleKeyPress}
                onBlur={handleHexSave}
              />
            </InputWrapper>
          </Popover.Trigger>
          <PickerWrapper>
            <HeaderWrapper>
              <PickerTitle size="footnote" weight="regular" color={theme.content.main}>
                {t("Color Picker")}
              </PickerTitle>
              {handleClose && <CloseIcon icon="cancel" size={12} onClick={handleClose} />}
            </HeaderWrapper>
            <SelectorPickerWrapper>
              <ColorPicker className="colorPicker" color={rgba} onChange={handleChange} />
              <RgbaInputWrapper>
                <Text size="footnote">RGBA</Text>
                <ValuesWrapper>
                  {channels.map(channel => (
                    <Input
                      key={channel}
                      name={channel}
                      type="number"
                      value={getChannelValue(rgba, channel as keyof RGBA)}
                      min={0}
                      max={255}
                      onChange={handleRgbaInput}
                    />
                  ))}
                </ValuesWrapper>
              </RgbaInputWrapper>
            </SelectorPickerWrapper>
            <FormButtonGroup>
              <ButtonWrapper
                buttonType="secondary"
                text={t("Cancel")}
                onClick={handleClose}
                size="medium"
              />
              <ButtonWrapper
                buttonType="primary"
                text={t("Apply")}
                onClick={handleSave}
                size="medium"
              />
            </FormButtonGroup>
          </PickerWrapper>
        </Popover.Provider>
      </Wrapper>
    </Property>
  );
};

const Wrapper = styled.div`
  text-align: center;
  width: 100%;
  cursor: pointer;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 4px;
  background: ${({ theme }) => theme.bg[1]};
`;

const Layers = styled.div`
  position: relative;
  min-width: 28px;
  min-height: 28px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset;
`;

const layerStyle = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const check = (color: string) => ` 
linear-gradient(
  45deg, 
  ${color} 25%, 
  transparent 25%, 
  transparent 75%, 
  ${color} 25%, 
  ${color} 
) 
`;

const CheckedPattern = styled.div`
  background-color: ${({ theme }) => theme.outline.main};
  background-image: ${({ theme }) => check(theme.bg[3])}, ${({ theme }) => check(theme.bg[3])};
  background-position: 0 0, 6px 6px;
  background-size: 12px 12px;
  ${layerStyle};
`;

const Swatch = styled.div<{ c?: string }>`
  background: ${({ c }) => c || "transparent"};
  ${layerStyle};
`;

const PickerWrapper = styled(Popover.Content)`
  width: 286px;
  height: 362px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
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

const SelectorPickerWrapper = styled.div`
  display: flex;
  padding: 8px;
  flex-direction: column;
  align-items: flex-start;
`;

const ValuesWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 4px;
  padding-top: 8px;
  padding-bottom: 8px;
`;

const Input = styled.input<{ type?: string }>`
  display: flex;
  padding: 4px 8px;
  align-items: center;
  margin: 0 auto;
  border-radius: 4px;
  gap: 4px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  color: ${({ theme }) => theme.content.main};
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset;
  box-sizing: border-box;
  outline: none;
  &:focus {
    border-color: ${({ theme }) => theme.outline.main};
  }
  width: 100%;
  height: 30px;
`;

const RgbaInputWrapper = styled.div`
  display: flex;
  height: 56px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
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

const ColorPickerStyles = css`
  padding: 8px 8px 6px 0px;
  gap: 12px;

  .react-colorful__saturation-pointer {
    width: 15px;
    height: 15px;
    border-width: 2px;
  }

  .react-colorful__hue-pointer,
  .react-colorful__alpha-pointer {
    width: 1px;
    height: 10px;
    border: 1px solid white;
    border-radius: 2px;
  }

  .react-colorful__saturation {
    margin-bottom: 10px;
    border-radius: 3px;
    width: 270px;
    border-bottom: none;
  }

  .react-colorful__hue,
  .react-colorful__alpha {
    height: 10px;
    width: 270px;
    margin: 0 5px 10px 3px;
    border-radius: 3px;
  }
`;

const ColorPicker = styled(RgbaColorPicker)`
  ${ColorPickerStyles}
`;

export default ColorField;
