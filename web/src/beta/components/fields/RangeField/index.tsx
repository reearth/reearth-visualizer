import { useCallback, useEffect, useState } from "react";

import Property from "@reearth/beta/components/fields";
import RangeSlider, { Props as RangeProps } from "@reearth/beta/components/RangeSlider";

export type Props = {
  name?: string;
  description?: string;
} & RangeProps;

const RangeField: React.FC<Props> = ({ name, description, value, onChange, ...args }: Props) => {
  const [internalState, setInternalState] = useState<number[] | undefined>(value);

  const handleChange = useCallback(
    (value: number[]) => {
      setInternalState(value);
    },
    [setInternalState],
  );

  useEffect(() => {
    setInternalState(value);
  }, [value]);

  return (
    <Property name={name} description={description}>
      <RangeSlider
        value={internalState}
        onChange={handleChange}
        onAfterChange={onChange}
        {...args}
      />
    </Property>
  );
};

export default RangeField;
