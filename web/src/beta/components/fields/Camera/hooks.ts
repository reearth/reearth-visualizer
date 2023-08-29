import { useState, useCallback } from "react";

export default () => {
  // const [colorState, setColor] = useState<string>();
  // const [tempColor, setTempColor] = useState(colorState);
  const [open, setOpen] = useState(false);

  //Actions
  const handleClose = useCallback(() => {
    // if (value || colorState) {
    //   setColor(value ?? colorState);
    //   setRgba(tinycolor(value ?? colorState).toRgb());
    // } else {
    //   setColor(undefined);
    //   setRgba(tinycolor(colorState == null ? undefined : colorState).toRgb());
    // }
    // setTempColor(undefined);
    setOpen(false);
  }, []);

  const handleSave = useCallback(() => {
    // if (!onChange) return;
    // if (tempColor && tempColor != value && tempColor != colorState) {
    //   setColor(tempColor);
    //   setRgba(tinycolor(tempColor).toRgb());
    //   onChange(tempColor);
    //   setTempColor(undefined);
    // } else if (colorState != value && colorState) {
    //   onChange(colorState);
    // }
    setOpen(false);
  }, []);

  //events
  const handleClick = useCallback(() => setOpen(!open), [open]);

  return {
    colorState: undefined,
    open,
    handleClose,
    handleSave,
    handleClick,
  };
};
