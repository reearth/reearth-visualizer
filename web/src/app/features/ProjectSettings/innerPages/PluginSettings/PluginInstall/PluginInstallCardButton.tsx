import { Icon, IconName, Typography } from "@reearth/app/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

export type Props = {
  className?: string;
  icon: IconName;
  text: string;
  onClick?: () => void;
};

const PluginInstallCardButton: FC<Props> = ({
  className,
  icon,
  text,
  onClick
}) => (
  <StyledButton onClick={onClick} className={className}>
    <Icon icon={icon} size={126} />
    <Typography size="h4">{text}</Typography>
  </StyledButton>
);

const StyledButton = styled("div")(({ theme }) => ({
  boxSizing: "border-box",
  flex: 1,
  minWidth: 375,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.bg[1],
  boxShadow: theme.shadow.button,
  borderRadius: theme.spacing.large,
  color: theme.content.main,
  cursor: "pointer",
  padding: `0 ${theme.spacing.largest}px ${theme.spacing.largest}px`,
  "&:hover": {
    backgroundColor: theme.bg[2]
  },
  transition: "all 0.1s"
}));

export default PluginInstallCardButton;
