import {
  Icon,
  IconName,
  Popup,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useMemo } from "react";

type TooltipProps = {
  type: "experimental" | "custom";
  icon?: IconName;
  text?: string;
};

const Tooltip: FC<TooltipProps> = ({ type, icon, text }) => {
  const theme = useTheme();
  const t = useT();

  const tooltipIcon: IconName | undefined = useMemo(
    () => (type === "experimental" ? ("flask" as const) : icon),
    [type, icon]
  );

  const tooltipText = useMemo(
    () =>
      type === "experimental"
        ? t(
            "This function is currently experimental and remains somewhat unstable."
          )
        : text,
    [type, text, t]
  );

  return (
    <Popup
      trigger={
        tooltipIcon ? (
          <IconWrapper>
            <Icon icon={tooltipIcon} color={theme.warning.weakest} />
          </IconWrapper>
        ) : (
          "TIPS" // TODO: support tigger as text
        )
      }
      triggerOnHover
    >
      <TipPanel>
        <Typography size="footnote" color={theme.warning.weak}>
          {tooltipText}
        </Typography>
      </TipPanel>
    </Popup>
  );
};

export default Tooltip;

const IconWrapper = styled("div")(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}));

const TipPanel = styled("div")(({ theme }) => ({
  maxWidth: "150px",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small,
  padding: `${theme.spacing.small}px`,
  background: theme.bg[1],
  color: theme.content.main,
  boxShadow: theme.shadow.card,
  borderRadius: theme.radius.normal
}));
