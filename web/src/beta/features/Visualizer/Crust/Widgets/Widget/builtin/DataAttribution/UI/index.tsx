import { IconButton, Typography } from "@reearth/beta/lib/reearth-ui";
import { Credit } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { fonts, styled } from "@reearth/services/theme";
import { FC } from "react";
import { Link } from "react-router-dom";

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
  const { processedCredits } = useDataAttribution({ credits, widget });

  return (
    <Wrapper>
      <IconWrapper>
        <IconButton
          icon="close"
          size="normal"
          onClick={onClose}
          appearance="simple"
          iconColor={theme?.weakIcon}
        />
      </IconWrapper>

      <ContentWrapper>
        <Title>{t("Data provided by:")}</Title>
        <Content>
          {processedCredits &&
            processedCredits.map((credit, i) => (
              <ListItems key={i}>
                {credit.link ? (
                  <StyledLink target="_blank" to={`${credit.link}`}>
                    <Typography color="#000" size="body">
                      {credit.description}
                    </Typography>
                  </StyledLink>
                ) : (
                  <Typography color="#000" size="body">
                    {credit.description}
                  </Typography>
                )}
              </ListItems>
            ))}
        </Content>
        <Footer />
      </ContentWrapper>
    </Wrapper>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing.small,
  background: "#ffffff",
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
  alignSelf: "stretch"
}));

const Title = styled("div")(({ theme }) => ({
  fontSize: fonts.sizes.body,
  lineHeight: `${fonts.lineHeights.body}px`,
  paddingBottom: theme.spacing.small
}));

const Content = styled("ul")(({ theme }) => ({
  padding: `0 ${theme.spacing.largest}px`,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.micro
}));

const ListItems = styled("li")(() => ({
  listStyleType: "disc",
  "::marker": {
    fontSize: "10px"
  }
}));

const StyledLink = styled(Link)(() => ({
  color: "#000"
}));

const Footer = styled("div")(() => ({
  height: 20
}));
