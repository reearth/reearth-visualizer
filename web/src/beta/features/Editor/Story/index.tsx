import { FC, useRef } from "react";

import { Window, Area } from "@reearth/beta/ui/layout";

import { useStoryPage } from "./context";
import PageSettingsPanel from "./PageSettingsPanel";
import PagesPanel from "./PagesPanel";

const Story: FC = () => {
  const { onVisualizerResize } = useStoryPage();
  const windowRef = useRef<HTMLDivElement>(null);

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area direction="column" resizableEdge="right" storageId="editor-story-left-area">
          <PagesPanel />
        </Area>
        <Area
          direction="column"
          extend
          onResize={onVisualizerResize}
          windowRef={windowRef}
          passive
        />
        <Area direction="column" resizableEdge="left" storageId="editor-story-right-area">
          <PageSettingsPanel />
        </Area>
      </Area>
    </Window>
  );
};

export default Story;
