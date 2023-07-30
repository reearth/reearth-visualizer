import React from "react";

import Flex from "@reearth/beta/components/Flex";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

export type Size = "small" | "large";

export type Props = {
  className?: string;
  size?: Size;
  background?: string;
  avatar?: string;
  innerText?: string | number;
  borderRadius?: string;
};

const Avatar: React.FC<Props> = ({
  className,
  size = "small",
  background,
  avatar,
  innerText,
  borderRadius = "50%",
}) => {
  const theme = useTheme();

  return (
    <StyledAvatar
      className={className}
      align="center"
      justify="center"
      size={size}
      avatar={avatar}
      background={background ?? theme.bg[4]}
      borderRadius={borderRadius}>
      {innerText && (
        <Text size="h4" color={theme.content.withBackground}>
          {typeof innerText === "number" ? `+${innerText.toString()}` : innerText.charAt(0)}
        </Text>
      )}
    </StyledAvatar>
  );
};
const StyledAvatar = styled(Flex)<{
  size?: Size;
  avatar?: string;
  background?: string;
  borderRadius?: string;
}>`
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  width: ${({ size }) => (size === "large" ? "64px" : "32px")};
  height: ${({ size }) => (size === "large" ? "64px" : "32px")};
  border-radius: ${({ borderRadius }) => borderRadius ?? "50%"};
  background: ${({ avatar, background }) => (avatar ? `url(${avatar});` : background)};
`;

export default Avatar;
