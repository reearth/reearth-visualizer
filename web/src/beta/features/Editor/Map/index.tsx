import { FC, useRef } from "react";

import { Window, Area, AreaRef } from "@reearth/beta/ui/layout";

import { useMapPage } from "./context";
import InspectorPanel from "./InspectorPanel";
import LayersPanel from "./LayersPanel";
import LayerStylePanel from "./LayerStylePanel";
import ScenePanel from "./ScenePanel";
import ToolsPanel from "./ToolsPanel";

const Map: FC = () => {
  const { handleVisualizerResize } = useMapPage();

  const windowRef = useRef<HTMLDivElement>(null);
  const secRightAreaRef = useRef<AreaRef>(null);
  const rightAreaRef = useRef<AreaRef>(null);

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area direction="column" resizableEdge="right" storageId="editor-map-left-area">
          <ScenePanel />
          <LayersPanel />
        </Area>
        <Area direction="column" extend asWrapper>
          <Area initialHeight={34}>
            <ToolsPanel />
          </Area>
          <Area extend onResize={handleVisualizerResize} windowRef={windowRef} passive />
        </Area>
        <Area
          direction="column"
          resizableEdge="left"
          storageId="editor-map-sec-right-area"
          ref={secRightAreaRef}>
          <InspectorPanel showCollapseArea areaRef={secRightAreaRef} />
        </Area>
        <Area
          direction="column"
          resizableEdge="left"
          storageId="editor-map-right-area"
          ref={rightAreaRef}>
          <LayerStylePanel showCollapseArea areaRef={rightAreaRef} />
        </Area>
      </Area>
    </Window>
  );
};

export default Map;
