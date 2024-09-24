import { TextInput, TextInputProps } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

interface ExpressionTabProps extends TextInputProps {
  iconContent?: string;
}

const ExpressionTab: FC<ExpressionTabProps> = ({
  value,
  onBlur,
  iconContent = "="
}) => {
  return (
    <Wrapper>
      <Icon>{iconContent}</Icon>
      <TextInput value={value} onBlur={onBlur} />
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
