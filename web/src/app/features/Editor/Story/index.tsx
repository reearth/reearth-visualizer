import { Window, Area, AreaRef } from "@reearth/app/ui/layout";
import { FC, useRef } from "react";

import { useStoryPage } from "./context";
import PageSettingsPanel from "./PageSettingsPanel";
import PagesPanel from "./PagesPanel";

const Story: FC = () => {
  const { handleVisualizerResize } = useStoryPage();

  const windowRef = useRef<HTMLDivElement>(null);
  const leftAreaRef = useRef<AreaRef>(null);
  const rightAreaRef = useRef<AreaRef>(null);

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area
          direction="column"
          resizableEdge="right"
          storageId="editor-story-left-area"
          ref={leftAreaRef}
        >
          <PagesPanel showCollapseArea areaRef={leftAreaRef} />
        </Area>
        <Area
          direction="column"
          extend
          onResize={handleVisualizerResize}
          windowRef={windowRef}
          passive
        />
        <Area
          direction="column"
          resizableEdge="left"
          storageId="editor-story-right-area"
          ref={rightAreaRef}
        >
          <PageSettingsPanel showCollapseArea areaRef={rightAreaRef} />
        </Area>
      </Area>
    </Window>
  );
};

export default Story;
