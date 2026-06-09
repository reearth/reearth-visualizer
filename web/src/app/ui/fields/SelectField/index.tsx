import { Selector, SelectorProps } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { FC } from "react";

export type SelectorFieldProps = CommonFieldProps & SelectorProps & {
  "data-testid"?: string;
};

const SelectorField: FC<SelectorFieldProps> = ({
  title,
  description,
  titleAdornment,
  beforeInput,
  afterInput,
  highlight,
  ...props
}) => {
  return (
    <CommonField
      title={title}
      description={description}
      titleAdornment={titleAdornment}
      beforeInput={beforeInput}
      afterInput={afterInput}
      highlight={highlight}
      data-testid="selectorfield-commonfield"
    >
      <Selector {...props} dataTestid={props["data-testid"]} />
    </CommonField>
  );
};

export default SelectorField;
