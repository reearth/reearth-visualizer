import type { ComponentProps as WidgetProps } from "..";

import useHooks from "./hooks";
import NavigatorPresenter from "./NavigatorPresenter";

export type Props = WidgetProps<Property>;

export type Property = {};

const Navigator = ({
  theme,
  context: { camera, onCameraOrbit, onCameraRotateRight, onFlyTo, onZoomIn, onZoomOut } = {},
}: Props): JSX.Element | null => {
  const { degree, events } = useHooks({
    camera,
    onCameraOrbit,
    onCameraRotateRight,
    onFlyTo,
    onZoomIn,
    onZoomOut,
  });

  return <NavigatorPresenter theme={theme} degree={degree} {...events} />;
};

export default Navigator;
