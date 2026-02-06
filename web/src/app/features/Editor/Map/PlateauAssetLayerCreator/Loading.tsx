import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

const Loading: FC = () => {
  const t = useT();
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>{t("Loading...")}</LoadingText>
    </LoadingContainer>
  );
};

const LoadingContainer = styled("div")(() => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center,
  padding: "20px",
  gap: "12px"
}));

const Spinner = styled("div")(({ theme }) => ({
  width: "24px",
  height: "24px",
  border: `2px solid ${theme.bg[2]}`,
  borderTop: `2px solid ${theme.primary.main}`,
  borderRadius: "50%",
  animation: "spin 1s linear infinite",

  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" }
  }
}));

const LoadingText = styled("div")(({ theme }) => ({
  fontSize: theme.fonts.sizes.footnote,
  color: theme.content.weak,
  textAlign: "center"
}));

export default Loading;
