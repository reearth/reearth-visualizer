import { TextInput, TextInputProps } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

const ExpressionTab: FC<TextInputProps> = ({ value, onChange }) => {
  return (
    <Wrapper>
      <Icon>=</Icon>
      <TextInput value={value} onChange={onChange} />
    </Wrapper>
  );
};

export default ExpressionTab;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center"
}));

const Icon = styled("div")(({ theme }) => ({
  color: theme.content.weak
}));
