import type { ComponentProps as WidgetProps } from "..";

import useHooks from "./hooks";
import NavigatorPresenter from "./NavigatorPresenter";

export type Props = WidgetProps<Property>;

export type Property = {};

const Navigator = ({
  theme,
  editing,
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
    onCameraOrbit,
    onCameraRotateRight,
    onFlyTo,
    onZoomIn,
    onZoomOut,
  });

  return <NavigatorPresenter theme={theme} degree={degree} editing={!!editing} {...events} />;
};

export default Navigator;
