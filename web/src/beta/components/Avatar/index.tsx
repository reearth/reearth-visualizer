import React from "react";

import Flex from "@reearth/beta/components/Flex";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

export type Size = "small" | "large";

export type Props = {
  className?: string;
  size?: Size;
  color?: string;
  avatar?: string;
  innerText?: string | number;
  boarderRadius?: string;
};

const Avatar: React.FC<Props> = ({
  className,
  size = "small",
  color,
  avatar,
  innerText,
  boarderRadius = "50%",
}) => {
  const theme = useTheme();

  return (
    <StyledAvatar
      className={className}
      align="center"
      justify="center"
      size={size}
      avatar={avatar}
      color={color ?? theme.main.avatarBg}
      boardeRradius={boarderRadius}>
      {innerText && (
        <Text size={"l"} color={theme.text.pale}>
          {typeof innerText === "number" ? `+${innerText.toString()}` : innerText.charAt(0)}
        </Text>
      )}
    </StyledAvatar>
  );
};
const StyledAvatar = styled(Flex)<{
  size?: Size;
  avatar?: string;
  color?: string;
  boardeRradius?: string;
}>`
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  width: ${({ size }) => (size === "large" ? "64px" : "32px")};
  height: ${({ size }) => (size === "large" ? "64px" : "32px")};
  border-radius: ${({ boardeRradius }) => (boardeRradius ? boardeRradius : "50%")};
  background: ${({ avatar, color }) => (avatar ? `url(${avatar});` : color)};
`;

export default Avatar;
