
import { Tabs } from "@reearth/beta/lib/reearth-ui";
import { Area, Window } from "@reearth/beta/ui/layout";
import { FC } from "react";

import useHooks from "./hooks";

const PluginPlayground: FC = () => {
  const { MainAreaTabs, BottomAreaTabs, SubRightAreaTabs, RightAreaTabs } =
    useHooks();

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
            <Tabs position="top" tabs={BottomAreaTabs} />
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
