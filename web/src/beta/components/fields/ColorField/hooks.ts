import { useState, useEffect, useCallback, useRef } from "react";
import tinycolor from "tinycolor2";

import { Params, RGBA } from "./types";
import { getChannelLabel, getChannelValue, getHexString } from "./utils";

export default ({ value, onChange }: Params) => {
  const [colorState, setColor] = useState<string>();
  const [rgba, setRgba] = useState<RGBA>(tinycolor(value).toRgb());
  const [tempColor, setTempColor] = useState(colorState);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

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
    [colorState]
  );

  const handleRgbaInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      handleChange({
        ...rgba,
        [e.target.name]: e.target.value ? Number(e.target.value) : undefined
      });
    },
    [handleChange, rgba]
  );

  const handleClose = useCallback(() => {
    if (value || colorState) {
      setColor(value ?? colorState);
      setRgba(tinycolor(value ?? colorState).toRgb());
    } else {
      setColor(undefined);
      setRgba(tinycolor(colorState == null ? undefined : colorState).toRgb());
    }
    setTempColor(undefined);
    setOpen(false);
  }, [value, colorState]);

  const handleSave = useCallback(() => {
    if (!onChange) return;
    if (tempColor && tempColor != value && tempColor != colorState) {
      setColor(tempColor);
      setRgba(tinycolor(tempColor).toRgb());
      onChange(tempColor);
      setTempColor(undefined);
    } else if (colorState != value) {
      onChange(colorState);
    }
    setOpen(false);
  }, [colorState, onChange, tempColor, value]);

  const handleHexSave = useCallback(() => {
    const hexPattern = /^#?([a-fA-F0-9]{3,4}|[a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/;
    if (!colorState || hexPattern.test(colorState)) {
      handleSave();
    } else if (value) {
      setColor(value);
    }
  }, [colorState, handleSave, value]);

  //events

  const handleClick = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleHexSave();
      }
    },
    [handleHexSave]
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

  const handleClickOutside = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (
        open &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        if (colorState != value && !open) {
          handleSave();
        }
        handleClose();
        setOpen(false);
      }
    },
    [open, value, colorState, handleSave, handleClose]
  );

  const handleClickOutsideRef = useRef(handleClickOutside);
  handleClickOutsideRef.current = handleClickOutside;

  const handleClickOutsideByRef = useCallback((e: MouseEvent | TouchEvent) => {
    handleClickOutsideRef.current?.(e);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideByRef);
    document.addEventListener("touchstart", handleClickOutsideByRef);

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideByRef);
      document.removeEventListener("touchstart", handleClickOutsideByRef);
    };
  }, [handleClickOutsideByRef]);

  return {
    wrapperRef,
    pickerRef,
    colorState,
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
    handleKeyPress
  };
};
