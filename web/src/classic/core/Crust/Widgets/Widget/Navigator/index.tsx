import type { ComponentProps as WidgetProps } from "..";
import { Visible } from "../useVisible";

import useHooks from "./hooks";
import NavigatorPresenter from "./NavigatorPresenter";

export type Props = WidgetProps<Property>;

export type Property = {
  default: {
    visible: Visible;
  };
};

const Navigator = ({
  theme,
  editing,
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
    onVisibilityChange,
  });

  return <NavigatorPresenter theme={theme} degree={degree} editing={!!editing} {...events} />;
};

export default Navigator;
