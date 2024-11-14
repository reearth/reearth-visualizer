import { Icon, Typography } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";

export const Section = styled("div")<{ disabled?: boolean }>(
  ({ disabled, theme }) => ({
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing.normal,
    gap: theme.spacing.large,
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? "not-allowed" : "auto"
  })
);

export const Header = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.normal,
  color: theme.warning.main
}));

export const Subtitle = styled(Typography)({
  textAlign: "left"
});

export const WarningIcon = styled(Icon)({
  width: "24px",
  height: "24px"
});

export const UrlWrapper = styled("div")<{ justify?: string }>(
  ({ justify, theme }) => ({
    display: "flex",
    justifyContent: justify ?? "center",
    gap: theme.spacing.small,
    alignItems: "center",
    border: `1px solid ${theme.outline.weak}`,
    borderRadius: "4px",
    padding: `${theme.spacing.small}px ${theme.spacing.large}px`,
    cursor: "pointer"
  })
);

export const UrlText = styled("div")<{ hasPublicUrl?: boolean }>(
  ({ hasPublicUrl, theme }) => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    fontSize: theme.fonts.sizes.body,
    whiteSpace: "break-spaces",
    color: hasPublicUrl ? theme.primary.main : "inherit",
    fontWeight: hasPublicUrl ? "bold" : "normal",
    cursor: hasPublicUrl ? "pointer" : "default"
  })
);

export const UrlAction = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 35,
  minHeight: 18,
  flexShrink: 0
}));
