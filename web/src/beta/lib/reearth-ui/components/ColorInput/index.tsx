import { FC } from "react";
import { RgbaColorPicker } from "react-colorful";

import { Button } from "@reearth/beta/lib/reearth-ui/components/Button";
import { NumberInput } from "@reearth/beta/lib/reearth-ui/components/NumberInput";
import { Popup } from "@reearth/beta/lib/reearth-ui/components/Popup";
import { TextInput } from "@reearth/beta/lib/reearth-ui/components/TextInput";
import { getChannelValue } from "@reearth/beta/utils/use-rgb-color";
import { fonts, styled } from "@reearth/services/theme";

import { PopupPanel } from "../PopupPanel";

import useHooks from "./hooks";

export type ColorInputProps = {
  value?: string;
  size?: "normal" | "small";
  disabled?: boolean;
  alphaEnabled?: boolean;
  onChange?: (text: string) => void;
};

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

const channels = ["r", "g", "b"];
const channelsWithAlpha = [...channels, "a"];
const DEFAULT_PANEL_OFFSET = 4;

export const ColorInput: FC<ColorInputProps> = ({
  value,
  disabled,
  size = "normal",
  alphaEnabled,
  onChange,
}) => {
  const {
    open,
    rgba,
    colorValue,
    isFocused,
    colorState,
    handleHexInputChange,
    handleColorChange,
    handleRgbaInputChange,
    handleHexInputBlur,
    handleRgbaInputBlur,
    handleToggle,
    handleSave,
  } = useHooks({
    value,
    disabled,
    onChange,
  });

  const displayedChannels = alphaEnabled ? channelsWithAlpha : channels;

  return (
    <InputWrapper>
      <Popup
        open={open}
        placement="bottom"
        offset={DEFAULT_PANEL_OFFSET}
        trigger={
          <Swatch
            color={colorState}
            onClick={handleToggle}
            status={isFocused}
            size={size}
            disabled={disabled}
          />
        }>
        <PopupPanel
          title="Color Picker"
          onCancel={handleToggle}
          actions={
            <ActionsWrapper>
              <Button extendWidth size="small" title="Cancel" onClick={handleToggle} />
              <Button
                extendWidth
                size="small"
                title="Apply"
                appearance="primary"
                onClick={handleSave}
              />
            </ActionsWrapper>
          }>
          <ColorPickerWrapper>
            <ColorPicker className="colorPicker" color={rgba} onChange={handleColorChange} />
            <RgbaText>{alphaEnabled ? "RGBA" : "RGB"}</RgbaText>
            <RgbaValuesWrapper>
              {displayedChannels.map(channel => (
                <NumberInput
                  key={channel}
                  value={getChannelValue(rgba, channel as keyof RGBA)}
                  onChange={value => handleRgbaInputChange(channel as keyof RGBA, value)}
                  onBlur={value => handleRgbaInputBlur(channel as keyof RGBA, value)}
                />
              ))}
            </RgbaValuesWrapper>
          </ColorPickerWrapper>
        </PopupPanel>
      </Popup>
      <TextInput
        value={colorValue}
        placeholder="#RRGGBBAA"
        onChange={handleHexInputChange}
        onBlur={handleHexInputBlur}
        disabled={disabled}
        size={size}
        extendWidth
      />
    </InputWrapper>
  );
};

const InputWrapper = styled("div")<{ width?: number }>(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "flex-start",
}));

const Swatch = styled("div")<{
  color?: string;
  status?: boolean;
  disabled?: boolean;
  size: "normal" | "small";
}>(({ theme, color, status, size, disabled }) => ({
  padding: size === "small" ? theme.spacing.small + 1 : theme.spacing.normal + 1,
  cursor: disabled ? "not-allowed" : "pointer",
  flexShrink: 0,
  borderRadius: theme.radius.small,
  background: color ? color : theme.bg[1],
  boxShadow: theme.shadow.input,
  border: status ? `1px solid ${theme.select.main}` : `1px solid ${theme.outline.weak}`,
}));

const ColorPicker = styled(RgbaColorPicker)(({ theme }) => ({
  gap: theme.spacing.normal,
  ".react-colorful__saturation-pointer": {
    width: "12px",
    height: "12px",
    borderWidth: theme.spacing.smallest - 2,
  },
  ".react-colorful__hue-pointer, .react-colorful__alpha-pointer": {
    width: "2px",
    height: "10px",
    border: `2px solid ${theme.item.default}`,
    borderRadius: theme.radius.smallest,
  },
  ".react-colorful__saturation, .react-colorful__hue, .react-colorful__alpha": {
    borderRadius: theme.radius.smallest + 1,
    width: "270px",
  },
  ".react-colorful__hue, .react-colorful__alpha": {
    height: "10px",
  },
}));

const ColorPickerWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing.normal,
}));

const RgbaText = styled("div")(() => ({
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
}));

const RgbaValuesWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing.smallest,
}));

const ActionsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: theme.spacing.small,
}));
