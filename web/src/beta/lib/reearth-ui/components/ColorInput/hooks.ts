import { useCallback, useEffect, useMemo, useState } from "react";
import { RgbaColor } from "react-colorful";
import tinycolor from "tinycolor2";

import { ColorInputProps } from ".";

const useColorPicker = ({
  value,
  alphaDisabled,
  onChange
}: Pick<ColorInputProps, "value" | "alphaDisabled" | "onChange">) => {
  const [colorValue, setColorValue] = useState<string | undefined>(value);
  const [pickerColor, setPickerColor] = useState<RgbaColor>(
    tinycolor(value).toRgb()
  );

  const [open, setOpen] = useState(false);
  const [isSwatchFocused, setSwatchFocused] = useState(false);

  const handlePickerOpenChange = useCallback((open: boolean) => {
    setSwatchFocused(open);
    setOpen(open);
  }, []);

  const handlePickerClose = useCallback(() => {
    setSwatchFocused(false);
    setOpen(false);
  }, []);

  const handleHexInputChange = useCallback((value: string) => {
    setColorValue(value);
  }, []);

  const handleHexInputBlur = useCallback(
    (newValue: string) => {
      const hexPattern =
        /^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/.test(newValue);
      const color = hexPattern ? newValue : colorValue;
      setPickerColor(tinycolor(color).toRgb());
      onChange?.(color || "");
    },
    [colorValue, onChange]
  );

  const handlePickerColorChange = useCallback((newColor: RgbaColor) => {
    setPickerColor(newColor);
  }, []);

  const handlePickerInputChange = useCallback(
    (channel: keyof RgbaColor, value?: string | number) => {
      if (!value) return;

      setPickerColor({
        ...pickerColor,
        [channel]: value
      });
    },
    [pickerColor]
  );

  const handlePickerCancel = useCallback(() => {
    handlePickerClose();
    setPickerColor(tinycolor(colorValue).toRgb());
  }, [colorValue, handlePickerClose]);

  const handlePickerApply = useCallback(() => {
    const color =
      "#" +
      (alphaDisabled
        ? tinycolor(pickerColor).toHex()
        : tinycolor(pickerColor).toHex8());
    setColorValue(color);
    onChange?.(color || "");
    handlePickerClose();
  }, [onChange, handlePickerClose, alphaDisabled, pickerColor]);

  const channels = useMemo(
    () =>
      (alphaDisabled
        ? ["r", "g", "b"]
        : ["r", "g", "b", "a"]) as (keyof RgbaColor)[],
    [alphaDisabled]
  );

  useEffect(() => {
    setColorValue(value);
    setPickerColor(tinycolor(value).toRgb());
  }, [value]);

  return {
    open,
    channels,
    colorValue,
    pickerColor,
    isSwatchFocused,
    handlePickerOpenChange,
    handlePickerColorChange,
    handlePickerInputChange,
    handlePickerApply,
    handlePickerCancel,
    handleHexInputChange,
    handleHexInputBlur
  };
};

export default useColorPicker;
