import { Placement } from "@floating-ui/react";
import {
  Icon,
  IconName,
  Popup,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, ReactNode, useMemo } from "react";

type TooltipProps = {
  type: "experimental" | "custom";
  icon?: IconName;
  text?: string;
  offset?: number;
  iconColor?: string;
  placement?: Placement;
  triggerComponent?: ReactNode; 
};

const Tooltip: FC<TooltipProps> = ({
  type,
  icon,
  text,
  offset = 6,
  iconColor,
  placement,
  triggerComponent
}) => {
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

  const trigger = useMemo(() => {
    if (triggerComponent) return triggerComponent;
    if (tooltipIcon) {
      return (
        <IconWrapper>
          <Icon
            icon={tooltipIcon}
            color={type === "experimental" ? theme.warning.weak : iconColor}
          />
        </IconWrapper>
      );
    }
    return <Typography size="footnote">TIPS</Typography>; // TODO: support tigger as text
  }, [triggerComponent, tooltipIcon, type, theme.warning.weak, iconColor]);

  return (
    <Popup
      offset={offset}
      placement={placement}
      trigger={trigger}
      triggerOnHover
      tooltip
    >
      <TipPanel>
        <Typography
          size="footnote"
          color={
            type === "experimental" ? theme.warning.weak : theme.content.strong
          }
        >
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
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  background: theme.bg[2],
  color: theme.content.main,
  boxShadow: theme.shadow.tooltip,
  borderRadius: theme.radius.normal
}));
