import logoWithText from "@reearth/beta/lib/reearth-ui/components/Icon/Icons/LogoWithText.svg";
import { styled } from "@reearth/services/theme";
import { brandRed } from "@reearth/services/theme/reearthTheme/common/colors";
import { FC } from "react";
import { BarLoader } from "react-spinners";

export type LoadingProps = {
  color?: string;
  fixed?: boolean;
  includeLogo?: boolean;
  relative?: boolean;
  overlay?: boolean;
  width?: number;
};

export const Loading: FC<LoadingProps> = ({
  color,
  fixed,
  includeLogo = false,
  relative,
  overlay,
  width
}) => {
  return (
    <LoadingWrapper fixed={fixed} overlay={overlay} relative={relative}>
      {includeLogo && (
        <LogoWrapper>
          <img src={logoWithText} width={343} height={106} />
        </LogoWrapper>
      )}
      <BarLoader width={width ?? 344} color={color ?? brandRed.dynamicRed} />
    </LoadingWrapper>
  );
};

const LogoWrapper = styled.div(() => ({
  display: "flex",
  alignItems: "center"
}));

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
  gap: 49,
  flexDirection: "column",
  background: overlay ? theme.bg[1] : "",
  position: fixed ? "fixed" : relative ? "relative" : "absolute",
  top: 0,
  left: 0,
  opacity: "0.8",
  zIndex: theme.zIndexes.editor.loading
}));
