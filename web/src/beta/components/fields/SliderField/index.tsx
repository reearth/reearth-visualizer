import { useCallback, useEffect, useState } from "react";

import Property from "@reearth/beta/components/fields";
import Slider, { Props as SliderProps } from "@reearth/beta/components/Slider";

export type Props = {
  name?: string;
  description?: string;
} & SliderProps;

const SliderField: React.FC<Props> = ({ name, description, value, onChange, ...args }: Props) => {
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
    <Property name={name} description={description}>
      <Slider value={internalState} onChange={handleChange} onAfterChange={onChange} {...args} />
    </Property>
  );
};

export default SliderField;
