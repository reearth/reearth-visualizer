import { FC } from "react";

import { TextInput, TextInputProps, Button, ButtonProps } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type AssetFieldProps = CommonFieldProps &
  Pick<TextInputProps, "value" | "placeholder" | "onChange" | "onBlur" | "disabled"> & {
    buttonFirstProps?: ButtonProps;
    buttonSecondProps?: ButtonProps;
  };

const AssetField: FC<AssetFieldProps> = ({
  title,
  description,
  buttonFirstProps,
  buttonSecondProps,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <TextInput {...props} />
      <ButtonWrapper>
        <Button {...buttonFirstProps} />
        <Button {...buttonSecondProps} />
      </ButtonWrapper>
    </CommonField>
  );
};

export default AssetField;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.small};
`;
