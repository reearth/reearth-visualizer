import type { ComponentProps as WidgetProps } from "../..";

import useHooks from "./hooks";
import NavigatorUI from "./UI";

export type Props = WidgetProps;

const Navigator = ({
  theme,
  widget,
  isMobile,
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
  const { degree, events } = useHooks({
    camera,
    initialCamera,
    widget,
    isMobile,
    onCameraOrbit,
    onCameraRotateRight,
    onFlyTo,
    onZoomIn,
    onZoomOut,
  });

  return <NavigatorUI theme={theme} degree={degree} {...events} />;
};

export default Navigator;
