import { TextInput } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type Props = {
  expression: string;
  onUpdate: (expression: string) => void;
};

const ExpressionTab: FC<Props> = ({ expression, onUpdate }) => {
  return (
    <Wrapper>
      <Icon>=</Icon>
      <TextInput value={expression} onBlur={onUpdate} />
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
