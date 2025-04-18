import { TextInput, TextInputProps } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { FC } from "react";


export type InputFieldProps = CommonFieldProps &
  Pick<
    TextInputProps,
    "value" | "placeholder" | "onChange" | "onBlur" | "disabled" | "appearance"
  >;

const InputField: FC<InputFieldProps> = ({ title, description, ...props }) => {
  return (
    <CommonField title={title} description={description}>
      <TextInput {...props} />
    </CommonField>
  );
};

export default InputField;
