import Property from "@reearth/beta/components/fields";
import Toggle, { Props as ToggleProps } from "@reearth/beta/components/Toggle";

export type Props = {
  name?: string;
  description?: string;
} & ToggleProps;

const ToggleField: React.FC<Props> = ({ name, description, ...args }: Props) => (
  <Property name={name} description={description}>
    <Toggle {...args} />
  </Property>
);

export default ToggleField;
