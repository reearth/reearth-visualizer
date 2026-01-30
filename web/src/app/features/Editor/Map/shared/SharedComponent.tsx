import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, ReactNode } from "react";
import { Link } from "react-router";

export const InputGroup: FC<{
  label: string | ReactNode;
  description?: string;
  children: ReactNode;
  "data-testid"?: string;
}> = ({ label, description, children, "data-testid": dataTestId }) => {
  return (
    <InputGroupWrapper data-testid={dataTestId || "input-group"}>
      <Label data-testid="input-group-label">{label}</Label>
      {children}
      {description && (
        <Description data-testid="input-group-description">
          {description}
        </Description>
      )}
    </InputGroupWrapper>
  );
};

const InputGroupWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  width: "100%",
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.flexStart,
  gap: theme.spacing.smallest
}));

export const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  height: "100%",
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.flexStart,
  gap: theme.spacing.large
}));

export const Label = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));

const Description = styled("div")(({ theme }) => ({
  color: theme.content.weak,
  fontSize: theme.fonts.sizes.footnote,
  fontWeight: theme.fonts.weight.regular
}));

export const InputsWrapper = styled("div")(() => ({
  width: "100%"
}));

export const SubmitWrapper = styled("div")(() => ({
  width: "100%",
  display: css.display.flex,
  justifyContent: css.justifyContent.flexEnd
}));

export const LayerWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  gap: theme.spacing.small
}));

export const LayerNameListWrapper = styled("div")(() => ({
  maxHeight: "250px",
  overflowY: css.overflow.auto,
  width: "100%"
}));

export const LayerNameList = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flexDirection: css.flexDirection.column,
  gap: theme.spacing.small
}));

export const ContentWrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  flex: 1,
  width: "100%",
  flexDirection: css.flexDirection.column,
  alignItems: css.alignItems.flexStart,
  gap: theme.spacing.large,
  boxSizing: css.boxSizing.borderBox,
  ["*"]: {
    boxSizing: css.boxSizing.borderBox
  },
  ...theme.scrollBar
}));

export const LinkWrapper = styled(Link)(({ theme }) => ({
  textDecoration: css.textDecoration.none,
  color: theme.select.strong,
  paddingRight: theme.spacing.micro
}));
