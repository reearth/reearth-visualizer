import { styled, useTheme } from "@reearth/services/theme";
import { FC } from "react";
import { RingLoader } from "react-spinners";


export type LoadingProps = {
  animationSize?: number;
  animationColor?: string;
  fixed?: boolean;
  relative?: boolean;
  overlay?: boolean;
};

export const Loading: FC<LoadingProps> = ({
  animationSize,
  animationColor,
  fixed,
  relative,
  overlay,
}) => {
  const theme = useTheme();

  return (
    <LoadingWrapper fixed={fixed} overlay={overlay} relative={relative}>
      <RingLoader
        size={animationSize ?? 33}
        color={animationColor ?? theme.select.main}
      />
    </LoadingWrapper>
  );
};

const LoadingWrapper = styled("div")<{
  fixed?: boolean;
  overlay?: boolean;
  relative?: boolean;
}>(({ theme, fixed, relative, overlay }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  background: overlay ? theme.bg[1] : "",
  position: fixed ? "fixed" : relative ? "relative" : "absolute",
  top: 0,
  left: 0,
  opacity: "0.8",
  zIndex: theme.zIndexes.editor.loading,
}));
