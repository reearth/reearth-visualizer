import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

export type Props = {
  onClick?: (value: boolean) => void;
  checked?: boolean;
  label: string;
};

const CheckBoxField: React.FC<Props> = ({ onClick, checked, label }) => {
  const theme = useTheme();
  return (
    <Field onClick={() => onClick?.(checked !== undefined ? checked : false)}>
      <BoxField>{checked && <CheckMark icon="checkmark" />}</BoxField>
      {label && (
        <Text size="footnote" color={theme.general.content.main}>
          {label}
        </Text>
      )}
    </Field>
  );
};

const Field = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 20px;
`;

const BoxField = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border: 1px solid ${({ theme }) => theme.general.content.weak};
  border-radius: 4px;
`;

const CheckMark = styled(Icon)`
  width: 15px;
  height: 10.83px;
  color: ${({ theme }) => theme.general.content.main};
`;

export default CheckBoxField;
