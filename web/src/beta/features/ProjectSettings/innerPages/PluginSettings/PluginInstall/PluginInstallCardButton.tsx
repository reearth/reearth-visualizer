import Text from "@reearth/beta/components/Text";
import { Icon, IconName } from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import React from "react";

export type Props = {
  className?: string;
  icon: IconName;
  text: string;
  onClick?: () => void;
};

const PluginInstallCardButton: React.FC<Props> = ({
  className,
  icon,
  text,
  onClick,
}) => (
  <StyledButton onClick={onClick} className={className}>
    <Icon icon={icon} size={126} />
    <Text size="h4">{text}</Text>
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
    backgroundColor: theme.bg[2],
  },
  transition: "all 0.1s",
}));

export default PluginInstallCardButton;
