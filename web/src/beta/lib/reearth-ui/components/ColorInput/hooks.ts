import { useCallback, useState } from "react";
import tinycolor from "tinycolor2";

import { checkRgbaRange, getHexString } from "@reearth/beta/utils/use-rgb-color";

import { ColorInputProps, RGBA } from ".";

const maxRgbValue = 255;
const initialRgba = { r: 255, g: 255, b: 255, a: 1 };

const useColorPicker = ({
  value,
  disabled,
  onChange,
}: Pick<ColorInputProps, "value" | "disabled" | "onChange">) => {
  const [colorValue, setColorValue] = useState<string | undefined>(value);
  const [rgba, setRgba] = useState<RGBA>(() => {
    return value ? tinycolor(value).toRgb() : initialRgba;
  });
  const [colorState, setColorState] = useState(colorValue);
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleHexInputChange = useCallback((value: string) => {
    setColorValue(value);
    const newColor = tinycolor(value).toRgb();
    setRgba(newColor);
  }, []);

  const handleHexInputBlur = useCallback(() => {
    const hexPattern = /^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/.test(colorValue || "");
    const color = !colorValue || hexPattern ? colorValue : value;
    setColorState(color);
    onChange?.(color || "");
  }, [colorValue, onChange, value]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setOpen(!open);
    setIsFocused(!open);
  }, [disabled, open]);

  const handleColorChange = useCallback((newColor: RGBA) => {
    setRgba(newColor);
  }, []);

  const handleRgbaInputChange = useCallback(
    (channel: keyof RGBA, value?: string | number) => {
      if (!value) return;

      handleColorChange({
        ...rgba,
        [channel]: value,
      });
    },
    [handleColorChange, rgba],
  );

  const handleRgbaInputBlur = useCallback(
    (channel: keyof RGBA, value?: string | number) => {
      if (!value) return;

      const numericValue =
        channel === "a" ? checkRgbaRange(value, 0, 1) : checkRgbaRange(value, 0, maxRgbValue);

      handleColorChange({
        ...rgba,
        [channel]: numericValue,
      });
    },
    [handleColorChange, rgba],
  );

  const handleSave = useCallback(() => {
    const color = getHexString(rgba);
    setColorState(color);
    setColorValue(color);
    onChange?.(color || "");
    handleToggle();
  }, [handleToggle, onChange, rgba]);

  return {
    open,
    colorValue,
    colorState,
    rgba,
    isFocused,
    handleHexInputChange,
    handleColorChange,
    handleRgbaInputChange,
    handleToggle,
    handleHexInputBlur,
    handleRgbaInputBlur,
    handleSave,
  };
};

export default useColorPicker;
