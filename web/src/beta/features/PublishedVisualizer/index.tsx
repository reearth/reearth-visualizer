import NotFound from "@reearth/beta/components/NotFound";
import Visualizer from "@reearth/beta/features/Visualizer";
import { useT } from "@reearth/services/i18n";

import useHooks from "./hooks";

export type Props = {
  alias?: string;
};

export default function Published({ alias }: Props) {
  const t = useT();
  const { sceneProperty, pluginProperty, layers, widgets, story, ready, error, engineMeta } =
    useHooks(alias);

  return error ? (
    <NotFound
      customHeader={t("Something went wrong.")}
      customMessage={t("Couldn't find the Re:Earth project you were after.")}
    />
  ) : (
    <Visualizer
      engine="cesium"
      engineMeta={engineMeta}
      isBuilt
      ready={ready}
      layers={layers}
      widgets={widgets}
      story={story}
      sceneProperty={sceneProperty}
      pluginProperty={pluginProperty}
      showStoryPanel={!!story}
    />
  );
}
