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
    <Field onClick={() => onClick?.(!checked)}>
      <BoxField>{checked && <CheckMark icon="checkmark" />}</BoxField>
      {label && (
        <StyledText size="footnote" color={theme.content.main}>
          {label}
        </StyledText>
      )}
    </Field>
  );
};

const Field = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 20px;
`;

const StyledText = styled(Text)`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BoxField = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
`;

const CheckMark = styled(Icon)`
  width: 15px;
  height: 10.83px;
  color: ${({ theme }) => theme.item.default};
`;

export default CheckBoxField;
