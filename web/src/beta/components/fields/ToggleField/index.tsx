import React from "react";

import Property from "@reearth/beta/components/fields";
import Toggle from "@reearth/beta/components/Toggle";

type ToggleProps = React.ComponentProps<typeof Toggle>;

type Props = {
  name?: string;
  description?: string;
} & ToggleProps;

const ToggleField: React.FC<Props> = ({ name, description, ...args }: Props) => {
  return (
    <Property name={name} description={description}>
      <Toggle {...args} />
    </Property>
  );
};

export default ToggleField;
