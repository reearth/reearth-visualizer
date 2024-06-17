import { FC } from "react";

import { TextInput, TextInputProps } from "@reearth/beta/lib/reearth-ui";

import CommonField, { CommonFieldProps } from "./CommonField";

export type TripletInputFieldProps = CommonFieldProps &
  Pick<TextInputProps, "value" | "placeholder" | "onChange" | "onBlur" | "disabled">;

const TripletInputField: FC<TripletInputFieldProps> = ({ title, description, ...props }) => {
  return (
    <CommonField title={title} description={description}>
      <TextInput {...props} />
      <TextInput {...props} />
      <TextInput {...props} />
    </CommonField>
  );
};

export default TripletInputField;
