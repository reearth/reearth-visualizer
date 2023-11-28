import { ComponentProps as WidgetProps } from "@reearth/classic/components/molecules/Visualizer/Widget";
import { usePublishTheme } from "@reearth/services/theme";

import { SceneProperty } from "../../Engine";
import { useVisible } from "../useVisible";

import useHooks from "./hooks";
import NavigatorPresenter from "./NavigatorPresenter";

export type Props = WidgetProps<SceneProperty>;

const Navigator = ({
  sceneProperty,
  widget,
  viewport,
  onVisibilityChange,
}: Props): JSX.Element | null => {
  const { sceneMode, degree, events } = useHooks({ sceneProperty });
  const publishedTheme = usePublishTheme(sceneProperty?.theme);

  const visible = useVisible({
    widgetId: widget.id,
    visible: widget.property?.default?.visible,
    isMobile: viewport?.isMobile,
    onVisibilityChange,
  });

  return visible ? (
    <NavigatorPresenter
      sceneMode={sceneMode}
      publishedTheme={publishedTheme}
      degree={degree}
      {...events}
    />
  ) : null;
};

export default Navigator;
