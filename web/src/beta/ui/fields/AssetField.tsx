import { FC } from "react";

import {
  TextInput,
  TextInputProps,
  Button,
  ButtonProps,
  Modal,
  ModalProps,
} from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type AssetFieldProps = CommonFieldProps &
  ModalProps &
  ButtonProps &
  Pick<TextInputProps, "value" | "placeholder" | "onChange" | "onBlur" | "disabled">;

const AssetField: FC<AssetFieldProps> = ({
  title,
  description,
  visible,
  children,
  size,
  appearance,
  icon,
  disabled,
  iconButton,
  title: titleButton,
  iconRight,
  extendWidth,
  minWidth,
  onClick,
  ...props
}) => {
  return (
    <CommonField title={title} description={description}>
      <TextInput {...props} />
      <ButtonWrapper>
        <Modal visible={visible} size={size}>
          {children}
        </Modal>
        <Button
          appearance={appearance}
          icon={icon}
          disabled={disabled}
          iconButton={iconButton}
          title={titleButton}
          iconRight={iconRight}
          extendWidth={extendWidth}
          minWidth={minWidth}
          onClick={onClick}
        />
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
