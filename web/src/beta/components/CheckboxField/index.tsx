import type { FC } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import Icon from "../Icon";
import Text from "../Text";

export type Props = {
  onClick?: (value: boolean) => void;
  checked?: boolean;
  label: string;
};

const CheckBoxField: FC<Props> = ({ onClick, checked, label }) => {
  const theme = useTheme();
  return (
    <Field>
      <BoxFeild onClick={() => onClick?.(checked !== undefined ? checked : false)}>
        {checked && <CheckMark icon="checkmark" />}
      </BoxFeild>
      {label && (
        <Text size="footnote" color={theme.general.content.main}>
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
  border: 1px solid ${({ theme }) => theme.general.content.weak};
  border-radius: 4px;
`;

const CheckMark = styled(Icon)`
  padding-left: 15%;
  padding-right: 10%;
  padding-top: 25%;
  padding-bottom: 20.83%;
  color: ${({ theme }) => theme.general.content.main};
`;

export default CheckBoxField;
