import { IconButton } from "@reearth/app/lib/reearth-ui";
import { Credit } from "@reearth/app/utils/value";
import { useT } from "@reearth/services/i18n/hooks";
import { fonts, styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

import { Theme } from "../../../types";

export type DataAttributionProps = {
  theme?: Theme;
  credits?: Credit[];
  onClose: () => void;
};

export const DataAttributionUI: FC<DataAttributionProps> = ({
  theme,
  credits,
  onClose
}) => {
  const t = useT();

  return (
    <Wrapper>
      <IconWrapper>
        <IconButton
          icon="close"
          size="normal"
          onClick={onClose}
          appearance="simple"
          iconColor={theme?.weakIcon ? theme?.weakIcon : "#000"}
        />
      </IconWrapper>
      <Title>{t("Data Provided by:")}</Title>
      <ContentWrapper>
        <Content>
          {credits &&
            credits.map((credit, i) => (
              <ListItem key={i}>
                <ListMarker>•</ListMarker>
                {credit.creditUrl ? (
                  <CreditItemLink
                    target="_blank"
                    href={credit.creditUrl}
                    rel="noopener noreferrer"
                  >
                    {credit.logo && (
                      <LogoWrapper noBg={credit.disableLogoBackground}>
                        <StyledImage src={credit.logo} />
                      </LogoWrapper>
                    )}
                    {credit.description && (
                      <CreditText>{credit.description}</CreditText>
                    )}
                  </CreditItemLink>
                ) : (
                  <CreditItem>
                    {credit.logo && (
                      <LogoWrapper noBg={credit.disableLogoBackground}>
                        <StyledImage src={credit.logo} />
                      </LogoWrapper>
                    )}
                    {credit.description && (
                      <CreditText>{credit.description}</CreditText>
                    )}
                  </CreditItem>
                )}
              </ListItem>
            ))}
        </Content>
      </ContentWrapper>
      <Footer />
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.flexStart,
  background: "#fff",
  color: "#000",
  boxShadow: theme.shadow.card,
  borderRadius: theme.radius.large,
  padding: theme.spacing.small
}));

const IconWrapper = styled("div")(() => ({
  alignSelf: "flex-end"
}));

const ContentWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  padding: `0 ${theme.spacing.largest}px`,
  alignItems: css.alignItems.flexStart,
  gap: theme.spacing.small + 2,
  alignSelf: "stretch",
  maxHeight: 200,
  overflowY: css.overflow.auto
}));

const Title = styled("div")(({ theme }) => ({
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
  padding: `0 ${theme.spacing.largest}px ${theme.spacing.large}px ${theme.spacing.largest}px`
}));

const Content = styled("ul")(({ theme }) => ({
  width: "100%",
  boxSizing: css.boxSizing.borderBox,
  margin: 0,
  padding: 0,
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.micro
}));

const ListItem = styled("li")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  gap: theme.spacing.normal
}));

const ListMarker = styled("div")(() => ({
  color: "#000",
  fontSize: fonts.sizes.body,
  width: 5
}));

const CreditItem = styled("div")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.flexStart,
  gap: theme.spacing.small
}));

const CreditItemLink = styled("a")(({ theme }) => ({
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.flexStart,
  gap: theme.spacing.small
}));

const CreditText = styled("span")(({ theme }) => ({
  color: "#000",
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  display: css.display.block
}));

const LogoWrapper = styled("div")<{ noBg?: boolean }>(({ theme, noBg }) => ({
  position: css.position.relative,
  boxSizing: css.boxSizing.borderBox,
  background: noBg ? "transparent" : theme.bg[3],
  padding: theme.spacing.micro,
  borderRadius: theme.radius.small,
  display: css.display.flex,
  alignItems: css.alignItems.center,
  justifyContent: css.justifyContent.center
}));

const StyledImage = styled("img")(() => ({
  maxHeight: 30,
  width: "auto"
}));

const Footer = styled("div")(() => ({
  height: 20
}));
