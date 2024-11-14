import { TextInput, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

type Props = {
  expression?: string;
  disabled?: boolean;
  onUpdate?: (expression: string) => void;
};

const ExpressionTab: FC<Props> = ({ expression, disabled, onUpdate }) => {
  const t = useT();

  return (
    <Wrapper>
      {disabled ? (
        <InfoWrapper>
          <Typography size="body" color="weak">
            {t(
              "Expression is incompatible with the current system for this node or value."
            )}
          </Typography>
        </InfoWrapper>
      ) : (
        <>
          <Icon>=</Icon>
          <TextInput
            value={expression ?? ""}
            onBlur={onUpdate}
            placeholder={t("${your property name}")}
          />
        </>
      )}
    </Wrapper>
  );
};

export default ExpressionTab;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center"
}));

const InfoWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing.small
}));

const Icon = styled("div")(({ theme }) => ({
  color: theme.content.weak
}));
