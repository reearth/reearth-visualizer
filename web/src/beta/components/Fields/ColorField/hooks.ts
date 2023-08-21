import { useState, useEffect, useCallback, useRef } from "react";
import tinycolor, { ColorInput } from "tinycolor2";

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export type Params = {
  value?: string;
  onChange?: (value: string) => void;
};

export default ({ value, onChange }: Params) => {
  const [colorState, setColor] = useState<string>();
  const [rgba, setRgba] = useState<RGBA>(tinycolor(value).toRgb());
  const [tempColor, setTempColor] = useState(colorState);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  //Helper functions

  const getHexString = (value?: ColorInput) => {
    if (!value) return undefined;
    const color = tinycolor(value);
    return color.getAlpha() === 1 ? color.toHexString() : color.toHex8String();
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case "r":
        return "Red";
      case "g":
        return "Green";
      case "b":
        return "Blue";
      case "a":
        return "Alpha";
      default:
        return "";
    }
  };

  function getChannelValue(rgba: RGBA, channel: keyof RGBA): number {
    return rgba[channel];
  }

  //Actions

  const handleChange = useCallback((newColor: RGBA) => {
    const color = getHexString(newColor);
    if (!color) return;
    setTempColor(color);
    setRgba(newColor);
  }, []);

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      setColor(e.target.value);
      setRgba(tinycolor(e.target.value ?? colorState).toRgb());
    },
    [colorState],
  );

  const handleRgbaInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      handleChange({
        ...rgba,
        [e.target.name]: e.target.value ? Number(e.target.value) : undefined,
      });
    },
    [handleChange, rgba],
  );

  const handleClose = useCallback(() => {
    if (value || colorState) {
      setColor(value ?? colorState);
      setRgba(tinycolor(value ?? colorState).toRgb());
    } else {
      setColor(undefined);
      setRgba(tinycolor(colorState == null ? undefined : colorState).toRgb());
    }
    setOpen(false);
  }, [value, colorState]);

  const handleSave = useCallback(() => {
    if (!onChange) return;
    if (tempColor && tempColor != value && tempColor != colorState) {
      setColor(tempColor);
      setRgba(tinycolor(tempColor).toRgb());
      onChange(tempColor);
    } else if (colorState != value && colorState) {
      onChange(colorState);
    }
    setOpen(false);
  }, [colorState, onChange, tempColor, value]);

  const handleHexSave = useCallback(() => {
    const hexPattern = /^#?([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;
    if (colorState && hexPattern.test(colorState)) {
      handleSave();
    } else {
      value && setColor(value);
    }
  }, [colorState, handleSave, value]);

  //events

  const handleClick = useCallback(() => setOpen(!open), [open]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleHexSave();
      }
    },
    [handleHexSave],
  );

  //UseEffects

  useEffect(() => {
    if (value) {
      setColor(value);
      setRgba(tinycolor(value).toRgb());
    } else {
      setColor(undefined);
    }
  }, [value]);

  useEffect(() => {
    if (!value) return;
    if (rgba && tinycolor(rgba).toHex8String() !== value) {
      setColor(tinycolor(rgba).toHex8String());
    }
  }, [rgba]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (open && wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        if (colorState != value && !open) {
          handleSave();
        }
        handleClose();
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [handleClose]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    wrapperRef,
    pickerRef,
    colorState,
    tempColor,
    open,
    rgba,
    getChannelLabel,
    getChannelValue,
    handleClose,
    handleSave,
    handleHexSave,
    handleChange,
    handleRgbaInput,
    handleHexInput,
    handleClick,
    handleKeyPress,
  };
};
