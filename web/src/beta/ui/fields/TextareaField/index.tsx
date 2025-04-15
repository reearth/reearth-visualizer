import { TextArea, TextAreaProps } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { FC } from "react";


export type TextAreaFieldProps = CommonFieldProps & TextAreaProps;

const TextAreaField: FC<TextAreaFieldProps> = ({
  title,
  description,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <TextArea {...props} />
    </CommonField>
  );
};

export default TextAreaField;
