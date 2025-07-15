import { Icon, Typography } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";

const NonAuth: FC = () => {
  const t = useT();
  const theme = useTheme();

  return (
    <Wrapper>
      <HeaderWrapper>
        <Icon icon="logoFullColor" size={40} />
        <Typography size="h4" weight="bold">
          {t("Re:Earth")}
        </Typography>
      </HeaderWrapper>
      <ContentWrapper>
        <VisualizerIcon>
          <Icon icon="logo" size={64} color={theme.dangerous.main} />
          <Typography size="h5">Visualizer</Typography>
        </VisualizerIcon>
        <DescriptionWrapper>
          <Description>
            <Typography size="h5">{t("Visualizer is part of the")}</Typography>
            <Typography size="h5" color={theme.primary.main}>
              {t("Re:Earth product ecosystem")}
            </Typography>
          </Description>
          <Typography size="h5">
            {t("To continue, please log in with your Re:Earth account.")}
          </Typography>
        </DescriptionWrapper>

        <LoginButton>
          <Typography size="h5" weight="bold">
            {t("Log In")}
          </Typography>
        </LoginButton>
        <DescriptionWrapper>
          <Typography size="h5">{t("Don't have an account?")}</Typography>
          <Typography size="h5" color={theme.primary.main}>
            👉 {t("Sign up on Re:Earth")}
          </Typography>
        </DescriptionWrapper>
      </ContentWrapper>
    </Wrapper>
  );
};

const Wrapper = styled("div")(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column"
}));

const HeaderWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  background: theme.bg[2],
  padding: "12px 40px",
  alignItems: "center",
  gap: theme.spacing.normal,
  alignSelf: "stretch"
}));

const ContentWrapper = styled("div")(({ theme }) => ({
  flex: 1,
  background: theme.bg[1],
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "40px"
}));

const VisualizerIcon = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal
}));

const DescriptionWrapper = styled("div")(() => ({}));

const Description = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small
}));

const LoginButton = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.dangerous.main,
  minWidth: 300,
  color: theme.content.main,
  borderRadius: theme.radius.normal,
  boxShadow: theme.shadow.button,
  cursor: "pointer",
  padding: `${theme.spacing.small}px ${theme.spacing.large}px`
}));

export default NonAuth;
