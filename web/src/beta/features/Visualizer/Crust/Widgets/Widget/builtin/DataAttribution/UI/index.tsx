import { IconButton } from "@reearth/beta/lib/reearth-ui";
import { Credit } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { fonts, styled } from "@reearth/services/theme";
import { FC } from "react";

import { Theme, Widget } from "../../../types";

import { useDataAttribution } from "./hooks";

export type DataAttributionProps = {
  theme?: Theme;
  widget: Widget;
  credits?: Credit[];
  onClose: () => void;
};

export const DataAttributionUI: FC<DataAttributionProps> = ({
  theme,
  widget,
  credits,
  onClose
}) => {
  const t = useT();
  const { processedCredits } = useDataAttribution({
    credits,
    widget
  });

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
          {processedCredits &&
            processedCredits.map((credit, i) => (
              <ListItem key={i}>
                <ListMarker>•</ListMarker>
                {credit.link ? (
                  <CreditItemLink
                    target="_blank"
                    href={credit.link}
                    rel="noopener noreferrer"
                  >
                    {credit.img && (
                      <LogoWrapper>
                        <StyledImage src={credit.img} />
                      </LogoWrapper>
                    )}
                    {credit.description && (
                      <CreditText>{credit.description}</CreditText>
                    )}
                  </CreditItemLink>
                ) : (
                  <CreditItem>
                    {credit.img && (
                      <LogoWrapper>
                        <StyledImage src={credit.img} />
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
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
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
  display: "flex",
  flexDirection: "column",
  padding: `0 ${theme.spacing.largest}px`,
  alignItems: "flex-start",
  gap: theme.spacing.small + 2,
  alignSelf: "stretch",
  maxHeight: 200,
  overflowY: "auto"
}));

const Title = styled("div")(({ theme }) => ({
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
  padding: `0 ${theme.spacing.largest}px ${theme.spacing.large}px ${theme.spacing.largest}px`
}));

const Content = styled("ul")(({ theme }) => ({
  width: "100%",
  boxSizing: "border-box",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.micro
}));

const ListItem = styled("li")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.normal
}));

const ListMarker = styled("div")(() => ({
  color: "#000",
  fontSize: fonts.sizes.body,
  width: 5
}));

const CreditItem = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: theme.spacing.small
}));

const CreditItemLink = styled("a")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: theme.spacing.small
}));

const CreditText = styled("span")(({ theme }) => ({
  color: "#000",
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  display: "block"
}));

const LogoWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  boxSizing: "border-box",
  background: theme.bg[3],
  padding: theme.spacing.micro,
  borderRadius: theme.radius.small,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}));

const StyledImage = styled("img")(() => ({
  maxHeight: 30,
  width: "auto"
}));

const Footer = styled("div")(() => ({
  height: 20
}));
