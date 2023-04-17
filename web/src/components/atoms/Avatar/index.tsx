import React from "react";

import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import { styled, useTheme } from "@reearth/theme";

export type Size = "small" | "large";

export type Props = {
  className?: string;
  size?: Size;
  color?: string;
  avatar?: string;
  innerText?: string | number;
};

const Avatar: React.FC<Props> = ({ className, size = "small", color, avatar, innerText }) => {
  const theme = useTheme();

  return (
    <StyledAvatar
      className={className}
      align="center"
      justify="center"
      size={size}
      avatar={avatar}
      color={color ?? theme.main.avatarBg}>
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
}>`
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  width: ${({ size }) => (size === "large" ? "64px" : "32px")};
  height: ${({ size }) => (size === "large" ? "64px" : "32px")};
  border-radius: 50%;
  background: ${({ avatar, color }) => (avatar ? `url(${avatar});` : color)};
`;

export default Avatar;
