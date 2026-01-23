import { Typography } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

const NoStyleMessage: FC = () => {
  const theme = useTheme();
  const t = useT();

  return (
    <TextWrapper>
      <Typography size="body" color={theme.content.weak}>
        {t("No style selected")}
      </Typography>
    </TextWrapper>
  );
};

export default NoStyleMessage;

const TextWrapper = styled("div")(() => ({
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}));
