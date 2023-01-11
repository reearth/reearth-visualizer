import type { ComponentProps as WidgetProps } from "..";

import useHooks from "./hooks";
import NavigatorPresenter from "./NavigatorPresenter";

export type Props = WidgetProps<Property>;

export type Property = {};

const Navigator = ({
  theme,
  context: { is2d, camera, onCameraOrbit, onCameraRotateRight, onFlyTo, onZoomIn, onZoomOut } = {},
}: Props): JSX.Element | null => {
  const { degree, events } = useHooks({
    camera,
    onCameraOrbit,
    onCameraRotateRight,
    onFlyTo,
    onZoomIn,
    onZoomOut,
  });

  return <NavigatorPresenter is2d={is2d} theme={theme} degree={degree} {...events} />;
};

export default Navigator;
