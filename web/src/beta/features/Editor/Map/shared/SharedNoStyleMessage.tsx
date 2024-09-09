import { Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

const SharedNoStyleMessage: FC = () => {
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

export default SharedNoStyleMessage;

const TextWrapper = styled("div")(() => ({
  height: 480,
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}));
