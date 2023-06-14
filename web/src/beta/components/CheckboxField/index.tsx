import type { FC } from "react";

import { styled, colors } from "@reearth/services/theme";

import Icon from "../Icon";
import Text from "../Text";

export type Props = {
  onChange?: (value: boolean) => void;
  checked?: boolean;
  label: string;
};

const CheckBoxField: FC<Props> = ({ onChange, checked, label }) => {
  return (
    <Field>
      <BoxFeild onClick={() => onChange?.(checked !== undefined ? checked : false)}>
        {checked && <CheckMark icon="checkmark" />}
      </BoxFeild>
      {label && (
        <Text size="xs" color={colors.publish.dark.text.main}>
          {label}
        </Text>
      )}
    </Field>
  );
};

const Field = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 20px;
`;

const BoxFeild = styled.button`
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border: 1px solid ${({ theme }) => theme.main.border};
  border-radius: 4px;
`;

const CheckMark = styled(Icon)`
  padding-left: 15%;
  padding-right: 10%;
  padding-top: 25%;
  padding-bottom: 20.83%;
  color: ${colors.publish.dark.text.main};
`;

export default CheckBoxField;
