import type { FC } from "react";

import { styled, useTheme, PublishTheme } from "@reearth/services/theme";

import Icon from "../Icon";
import Text from "../Text";

export type Props = {
  publishedTheme?: PublishTheme;
  onChange?: (value: boolean) => void;
  checked?: boolean;
  label: string;
};

const CheckBoxField: FC<Props> = ({ onChange, checked, label, publishedTheme }) => {
  const theme = useTheme();
  return (
    <Field>
      <BoxFeild
        onClick={() => onChange?.(checked !== undefined ? checked : false)}
        publishedTheme={publishedTheme}>
        {checked && <CheckMark icon="checkmark" publishedTheme={publishedTheme} />}
      </BoxFeild>
      {label && (
        <Text size="xs" color={publishedTheme?.mainText || theme.main.text}>
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

const BoxFeild = styled.button<{ publishedTheme?: PublishTheme }>`
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border: 1px solid ${({ theme, publishedTheme }) => publishedTheme?.weakText || theme.main.weak};
  border-radius: 4px;
`;

const CheckMark = styled(Icon)<{ publishedTheme?: PublishTheme }>`
  padding-left: 15%;
  padding-right: 10%;
  padding-top: 25%;
  padding-bottom: 20.83%;
  color: ${({ theme, publishedTheme }) => publishedTheme?.mainText || theme.main.text};
`;

export default CheckBoxField;
