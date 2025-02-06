import { Tabs } from "@reearth/beta/lib/reearth-ui";
import { Area, Panel, Window } from "@reearth/beta/ui/layout";
import { FC } from "react";

import useHooks from "./hooks";

const PluginPlayground: FC = () => {
  const {
    LayersPanel,
    MainAreaTabs,
    RightAreaTabs,
    SettingsPanel,
    SubRightAreaTabs
  } = useHooks();

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
            <Panel noPadding alwaysOpen extend title="Layers">
              <LayersPanel />
            </Panel>
            <Panel noPadding alwaysOpen extend title="Settings">
              <SettingsPanel />
            </Panel>
            {/* TODO: Need to fix state management of each individual input field in Extension Settings */}
            {/* <Panel noPadding alwaysOpen extend title="Widgets">
              <ExtensionSettingsPanel />
            </Panel> */}
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
