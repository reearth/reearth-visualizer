import { useCallback, useState } from "react";
import tinycolor, { ColorInput } from "tinycolor2";

import { ColorInputProps, RGBA } from ".";

export default ({ value, onChange }: Pick<ColorInputProps, "value" | "onChange">) => {
  const [colorValue, setColorValue] = useState<string | undefined>(value);
  const [rgba, setRgba] = useState<RGBA>(tinycolor(value).toRgb());
  const [open, setOpen] = useState(false);
  const [colorState, setColorState] = useState(colorValue);

  const getHexString = useCallback((value?: ColorInput) => {
    if (!value) return undefined;
    const color = tinycolor(value);
    return color.getAlpha() === 1 ? color.toHexString() : color.toHex8String();
  }, []);

  const handleColorChange = useCallback(
    (newColor: RGBA) => {
      const color = getHexString(newColor);
      if (!color) return;
      setColorValue(color);
      setRgba(newColor);
    },
    [getHexString],
  );

  const handleChange = useCallback((value: string) => {
    setColorValue(value);
    setRgba(tinycolor(value).toRgb());
  }, []);

  const handleBlur = useCallback(() => {
    const hexPattern = /^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/.test(colorValue || "");
    const color = !colorValue || hexPattern ? colorValue : value;
    setColorState(color);
    onChange?.(color || "");
  }, [colorValue, onChange, value]);

  const handleOpen = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return {
    open,
    colorValue,
    colorState,
    rgba,
    handleChange,
    handleColorChange,
    handleOpen,
    handleBlur,
  };
};
