import { ComponentProps as WidgetProps } from "@reearth/components/molecules/Visualizer/Widget";
import { usePublishTheme } from "@reearth/theme";

import { SceneProperty } from "../../Engine";

import useHooks from "./hooks";
import NavigatorPresenter from "./NavigatorPresenter";

export type Props = WidgetProps<SceneProperty>;

const Navigator = ({ sceneProperty }: Props): JSX.Element | null => {
  const { sceneMode, degree, events } = useHooks({ sceneProperty });
  const publishedTheme = usePublishTheme(sceneProperty?.theme);

  return (
    <NavigatorPresenter
      sceneMode={sceneMode}
      publishedTheme={publishedTheme}
      degree={degree}
      {...events}
    />
  );
};

export default Navigator;
