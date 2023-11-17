import type { ComponentProps as WidgetProps } from "../..";
import { Visible } from "../../useVisible";

import useHooks from "./hooks";
import NavigatorUI from "./UI";

export type Props = WidgetProps<Property>;

export type Property = {
  default: {
    visible: Visible;
  };
};

const Navigator = ({
  theme,
  widget,
  isMobile,
  onVisibilityChange,
  context: {
    camera,
    initialCamera,
    onCameraOrbit,
    onCameraRotateRight,
    onFlyTo,
    onZoomIn,
    onZoomOut,
  } = {},
}: Props): JSX.Element | null => {
  const { degree, visible, events } = useHooks({
    camera,
    initialCamera,
    widget,
    isMobile,
    onCameraOrbit,
    onCameraRotateRight,
    onFlyTo,
    onZoomIn,
    onZoomOut,
    onVisibilityChange,
  });

  return visible ? <NavigatorUI theme={theme} degree={degree} {...events} /> : null;
};

export default Navigator;
