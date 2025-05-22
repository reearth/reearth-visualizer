import { Collapse, Typography } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
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
  gap: theme.spacing.largest,
  width: "100%",
  flex: 1,
  ["> div:not(:last-child)"]: {
    borderBottom: `1px solid ${theme.outline.weaker}`
  }
}));

export const SettingsFields = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.largest,
  padding: `${theme.spacing.normal}px ${theme.spacing.largest}px ${theme.spacing.largest}px`
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

export const Thumbnail = styled("div")<{ src?: string }>(({ src, theme }) => ({
  width: "100%",
  paddingBottom: "52.3%",
  fontSize: 0,
  background: src ? `url(${src}) center/contain no-repeat` : "",
  backgroundColor: theme.relative.dark,
  borderRadius: theme.radius.small
}));

export const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  gap: theme.spacing.small
}));

export const TitleWrapper = styled(Typography)(({ theme }) => ({
  color: theme.content.main
}));

export const ArchivedSettingNotice: React.FC = () => {
  const t = useT();
  return (
    <Collapse title={t("Notice")} size="large">
      <Typography size="body">
        {t(
          "Most project settings are hidden when the project is archived. Please unarchive the project to view and edit these settings."
        )}
      </Typography>
    </Collapse>
  );
};
