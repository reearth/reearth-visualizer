import { FC, useRef } from "react";

import { Window, Area } from "@reearth/beta/ui/layout";

import PageSettingsPanel from "./PageSettingsPanel";
import PagesPanel from "./PagesPanel";
import { useStoryPage } from "./storyPageContext";

type Props = {};

const Story: FC<Props> = () => {
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
