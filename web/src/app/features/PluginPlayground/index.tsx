import { Tabs } from "@reearth/app/lib/reearth-ui";
import { Area, Panel, Window } from "@reearth/app/ui/layout";
import { useT } from "@reearth/services/i18n/hooks";
import { FC } from "react";

import useHooks from "./hooks";

const PluginPlayground: FC = () => {
  const {
    LayersPanel,
    MainAreaTabs,
    RightAreaTabs,
    SettingsPanel,
    SubRightAreaTabs,
    ExtensionSettingsPanel
  } = useHooks();

  const t = useT();

  return (
    <Window>
      <Area extend asWrapper>
        <Area direction="column" extend asWrapper>
          <Area extend>
            <Tabs position="top" tabs={MainAreaTabs} />
          </Area>
          <Area
            resizableEdge="top"
            initialHeight={100}
            storageId="plugin-playground-bottom-area"
          >
            <Panel noPadding alwaysOpen extend title={t("Layers")}>
              <LayersPanel />
            </Panel>
            <Panel noPadding alwaysOpen extend title={t("Settings")}>
              <SettingsPanel />
            </Panel>
            <Panel noPadding alwaysOpen extend title={t("Extension Settings")}>
              <ExtensionSettingsPanel />
            </Panel>
          </Area>
        </Area>
        <Area
          direction="column"
          resizableEdge="left"
          storageId="plugin-playground-sub-right-area"
        >
          <Tabs position="top" tabs={SubRightAreaTabs} />
        </Area>
        <Area
          direction="column"
          resizableEdge="left"
          storageId="plugin-playground-right-area"
        >
          <Tabs position="top" tabs={RightAreaTabs} />
        </Area>
      </Area>
    </Window>
  );
};

export default PluginPlayground;
