import {
  Button,
  NumberInput,
  Popup,
  TextInput,
  PopupPanel
} from "@reearth/beta/lib/reearth-ui/components";
import { useT } from "@reearth/services/i18n";
import { fonts, styled } from "@reearth/services/theme";
import { FC } from "react";
import { RgbaColorPicker } from "react-colorful";

import useHooks from "./hooks";

export type ColorInputProps = {
  value?: string;
  size?: "normal" | "small";
  disabled?: boolean;
  alphaDisabled?: boolean;
  appearance?: "readonly" | undefined;
  onChange?: (text: string) => void;
  ariaLabel?: string;
  dataTestid?: string;
};

const DEFAULT_PANEL_OFFSET = 4;

export const ColorInput: FC<ColorInputProps> = ({
  value,
  disabled,
  size = "normal",
  alphaDisabled,
  appearance,
  onChange,
  ariaLabel,
  dataTestid
}) => {
  const {
    open,
    channels,
    pickerColor,
    colorValue,
    isSwatchFocused,
    handlePickerOpenChange,
    handlePickerColorChange,
    handlePickerInputChange,
    handleHexInputChange,
    handleHexInputBlur,
    handlePickerApply,
    handlePickerCancel
  } = useHooks({
    value,
    alphaDisabled,
    onChange
  });
  const t = useT();

  return (
    <InputWrapper data-testid={dataTestid}>
      <Popup
        open={open}
        placement="bottom"
        disabled={disabled}
        offset={DEFAULT_PANEL_OFFSET}
        onOpenChange={handlePickerOpenChange}
        trigger={
          <Swatch
            color={colorValue}
            alphaDisabled={alphaDisabled}
            status={isSwatchFocused}
            size={size}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-valuetext={colorValue}
          />
        }
      >
        <PopupPanel
          title="Color Picker"
          onCancel={handlePickerCancel}
          actions={
            <ActionsWrapper>
              <Button
                extendWidth
                size="small"
                title={t("Cancel")}
                onClick={handlePickerCancel}
              />
              <Button
                extendWidth
                size="small"
                title={t("Apply")}
                appearance="primary"
                onClick={handlePickerApply}
              />
            </ActionsWrapper>
          }
        >
          <ColorPickerWrapper role="application">
            <ColorPicker
              className="colorPicker"
              alphaDisabled={alphaDisabled}
              color={pickerColor}
              onChange={handlePickerColorChange}
            />
            <Format>{alphaDisabled ? "RGB" : "RGBA"}</Format>
            <ChannelsWrapper>
              {channels.map((channel) => (
                <NumberInput
                  key={channel}
                  value={pickerColor[channel]}
                  onChange={(value) => handlePickerInputChange(channel, value)}
                  max={channel === "a" ? 1 : 255}
                  min={0}
                />
              ))}
            </ChannelsWrapper>
          </ColorPickerWrapper>
        </PopupPanel>
      </Popup>
      <TextInput
        value={colorValue}
        placeholder={alphaDisabled ? "#RRGGBB" : "#RRGGBBAA"}
        onChange={handleHexInputChange}
        onBlur={(value) => handleHexInputBlur(value)}
        disabled={disabled}
        appearance={appearance}
        size={size}
        maxLength={alphaDisabled ? 7 : 9}
        extendWidth
      />
    </InputWrapper>
  );
};

const InputWrapper = styled("div")<{ width?: number }>(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "flex-start",
  width: "100%"
}));

const Swatch = styled("div")<{
  color?: string;
  status?: boolean;
  disabled?: boolean;
  alphaDisabled?: boolean;
  size: "normal" | "small";
}>(({ theme, color, status, size, disabled, alphaDisabled }) => ({
  position: "relative",
  boxSizing: "border-box",
  width: size === "small" ? 20 : 28,
  height: size === "small" ? 20 : 28,
  cursor: disabled ? "not-allowed" : "pointer",
  flexShrink: 0,
  borderRadius: theme.radius.small,
  boxShadow: theme.shadow.input,
  border: status
    ? `1px solid ${theme.select.main}`
    : `1px solid ${theme.outline.weak}`,
  backgroundImage: alphaDisabled
    ? ""
    : `linear-gradient(45deg, ${theme.bg[2]} 25%, transparent 25%), linear-gradient(-45deg, ${theme.bg[2]} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${theme.bg[2]} 75%), linear-gradient(-45deg, transparent 75%, ${theme.bg[2]} 75%)`,
  backgroundSize: `${theme.spacing.small}px ${theme.spacing.small}px`,
  backgroundPosition: `0 0, 0 ${theme.spacing.small / 2}px, ${theme.spacing.small / 2}px -${
    theme.spacing.small / 2
  }px, -${theme.spacing.small / 2}px 0px`,
  overflow: "hidden",

  ["&:before"]: {
    content: '""',
    display: "block",
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    boxShadow: theme.shadow.input,
    background: color ? color : ""
  }
}));

const ColorPicker = styled(RgbaColorPicker, {
  shouldForwardProp: (prop) => prop !== "alphaDisabled"
})<{ alphaDisabled?: boolean }>(({ theme, alphaDisabled }) => ({
  gap: theme.spacing.normal,
  ".react-colorful__saturation-pointer": {
    width: "12px",
    height: "12px",
    borderWidth: theme.spacing.smallest - 2
  },
  ".react-colorful__hue-pointer, .react-colorful__alpha-pointer": {
    width: "2px",
    height: "10px",
    border: `2px solid ${theme.item.default}`,
    borderRadius: theme.radius.smallest
  },
  ".react-colorful__alpha.react-colorful__last-control": {
    display: alphaDisabled ? "none" : "auto"
  },
  ".react-colorful__saturation, .react-colorful__hue, .react-colorful__alpha": {
    borderRadius: theme.radius.smallest + 1,
    width: "270px"
  },
  ".react-colorful__hue, .react-colorful__alpha": {
    height: "10px"
  },
  ".react-colorful__saturation": {
    borderBottom: "none !important"
  }
}));

const ColorPickerWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing.normal
}));

const Format = styled("div")(() => ({
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`
}));

const ChannelsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: theme.spacing.smallest
}));

const ActionsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  gap: theme.spacing.small
}));
