import { useCallback, useEffect, useState, FC } from "react";

import Slider, { Props as SliderProps } from "@reearth/beta/components/Slider";

import CommonField, { CommonFieldProps } from "./CommonField";

export type SliderFieldProps = CommonFieldProps & SliderProps;

const SliderField: FC<SliderFieldProps> = ({
  commonTitle,
  description,
  value,
  onChange,
  ...args
}: SliderFieldProps) => {
  const [internalState, setInternalState] = useState(value);

  const handleChange = useCallback(
    (value: number) => {
      setInternalState(value);
    },
    [setInternalState],
  );

  useEffect(() => {
    setInternalState(value);
  }, [value]);

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <Slider value={internalState} onChange={handleChange} onAfterChange={onChange} {...args} />
    </CommonField>
  );
};

export default SliderField;
