import { keyframes, styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC } from "react";

// Eight spokes fading in turn around the centre.
const SPOKES = [0, 1, 2, 3, 4, 5, 6, 7];

const Spinner: FC<{ size?: number }> = ({ size = 20 }) => (
  <Wrapper size={size} aria-hidden>
    {SPOKES.map((i) => (
      <Spoke key={i} index={i} size={size} />
    ))}
  </Wrapper>
);

const fade = keyframes`
  from { opacity: 1; }
  to { opacity: 0.2; }
`;

const Wrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "size"
})<{ size: number }>(({ size }) => ({
  position: css.position.relative,
  flexShrink: 0,
  width: size,
  height: size
}));

const Spoke = styled("span", {
  shouldForwardProp: (prop) => prop !== "index" && prop !== "size"
})<{ index: number; size: number }>(({ theme, index, size }) => ({
  position: css.position.absolute,
  left: size / 2 - 1,
  top: 0,
  width: 2,
  height: size * 0.3,
  borderRadius: 1,
  background: theme.content.main,
  transformOrigin: `1px ${size / 2}px`,
  transform: `rotate(${index * 45}deg)`,
  animation: `${fade} 0.8s linear infinite`,
  animationDelay: `${(index - SPOKES.length) * 0.1}s`
}));

export default Spinner;
