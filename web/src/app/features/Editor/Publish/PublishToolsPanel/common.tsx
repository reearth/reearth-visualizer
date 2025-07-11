import { Icon, Typography } from "@reearth/app/lib/reearth-ui";
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

export const UrlWrapper = styled("div")<{
  justify?: string;
  noPadding?: boolean;
}>(({ justify, noPadding, theme }) => ({
  display: "flex",
  justifyContent: justify ?? "center",
  gap: theme.spacing.small,
  alignItems: "center",
  border: `1px solid ${theme.outline.weak}`,
  borderRadius: "4px",
  flex: 1,
  padding: noPadding
    ? `0 ${theme.spacing.small}px`
    : `${theme.spacing.small}px ${theme.spacing.large}px`,
  cursor: "pointer"
}));

export const UrlText = styled("div")<{ hasPublicUrl?: boolean }>(
  ({ hasPublicUrl, theme }) => ({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: theme.fonts.sizes.body,
    whiteSpace: "break-spaces",
    color: hasPublicUrl ? theme.primary.main : "inherit",
    fontWeight: hasPublicUrl ? "bold" : "normal",
    cursor: hasPublicUrl ? "pointer" : "default",
    textDecoration: hasPublicUrl ? "underline" : "none"
  })
);

export const UrlAction = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 18,
  flexShrink: 0
}));

export const PublicUrlWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  alignItems: "center"
}));

export const PublishStatus = styled("div")<{ isPublished?: boolean }>(
  ({ theme, isPublished }) => ({
    width: "8px",
    height: "8px",
    backgroundColor: isPublished ? theme.publish.main : theme.content.weaker,
    borderRadius: "50%"
  })
);
