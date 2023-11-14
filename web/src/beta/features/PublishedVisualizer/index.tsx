import NotFound from "@reearth/beta/components/NotFound";
import StoryPanel from "@reearth/beta/lib/core/StoryPanel";
import Visualizer from "@reearth/beta/lib/core/Visualizer";
import { config } from "@reearth/services/config";
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
      isBuilt
      layers={layers}
      floatingWidgets={widgets?.floatingWidgets}
      widgetAlignSystem={widgets?.alignSystem}
      ownBuiltinWidgets={widgets?.ownBuiltinWidgets}
      sceneProperty={sceneProperty}
      pluginProperty={pluginProperty}
      ready={ready}
      storyPanelPosition={story?.position}
      pluginBaseUrl={config()?.plugins}
      meta={engineMeta}>
      {story && <StoryPanel selectedStory={story} />}
    </Visualizer>
  );
}
