import { Selector, SelectorProps } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { FC } from "react";

export type SelectorFieldProps = CommonFieldProps & SelectorProps;

const SelectorField: FC<SelectorFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField
      title={title}
      description={description}
      data-testid="selectorfield-commonfield"
    >
      <Selector {...props} />
    </CommonField>
  );
};

export default SelectorField;
