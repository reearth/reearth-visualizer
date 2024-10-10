import { styled } from "@reearth/services/theme";

export const InnerPage = styled("div")<{
  wide?: boolean;
  transparent?: boolean;
}>(({ wide, transparent, theme }) => ({
  boxSizing: "border-box",
  display: "flex",
  width: "100%",
  maxWidth: wide ? 950 : 750,
  backgroundColor: transparent ? "none" : theme.bg[1],
  borderRadius: theme.radius.normal
}));

export const InnerSidebar = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: 213,
  borderRight: `1px solid ${theme.outline.weaker}`,
  padding: `${theme.spacing.normal}px 0`
}));

export const SettingsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  flex: 1,
  ["> div:not(:last-child)"]: {
    borderBottom: `1px solid ${theme.outline.weaker}`
  }
}));

export const SettingsFields = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.largest
}));

export const SettingsRow = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  flexDirection: "row",
  gap: theme.spacing.largest
}));

export const SettingsRowItem = styled("div")(() => ({
  width: "100%"
}));
