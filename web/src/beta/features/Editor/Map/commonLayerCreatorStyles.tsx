import { FC, ReactNode } from "react";

import { styled } from "@reearth/services/theme";

export const InputGroup: FC<{
  label: string;
  description?: string;
  children: ReactNode;
}> = ({ label, description, children }) => {
  return (
    <InputGroupWrapper>
      <Label>{label}</Label>
      {children}
      {description && <Description>{description}</Description>}
    </InputGroupWrapper>
  );
};

const InputGroupWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing.smallest,
}));

export const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  height: "100%",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing.large,
}));

export const Label = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
}));

const Description = styled("div")(({ theme }) => ({
  color: theme.content.weak,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
}));

export const InputsWrapper = styled("div")(() => ({
  width: "100%",
}));

export const SubmitWrapper = styled("div")(() => ({
  width: "100%",
  display: "flex",
  justifyContent: "flex-end",
}));

export const LayerWrapper = styled("div")(() => ({
  display: "flex",
}));

export const LayerNameListWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  width: "100%",
}));
