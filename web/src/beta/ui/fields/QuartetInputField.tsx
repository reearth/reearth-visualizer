import { FC } from "react";

import { TextInput, TextInputProps } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type QuartetInputFieldProps = CommonFieldProps &
  Pick<TextInputProps, "value" | "placeholder" | "onChange" | "onBlur" | "disabled">;

const QuartetInputField: FC<QuartetInputFieldProps> = ({ title, description, ...props }) => {
  return (
    <CommonField title={title} description={description}>
      <InputWrapper>
        <TextInput {...props} />
        <TextInput {...props} />
        <TextInput {...props} />
        <TextInput {...props} />
      </InputWrapper>
    </CommonField>
  );
};

export default QuartetInputField;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.small};
`;
