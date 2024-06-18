import { FC, useRef } from "react";

import { Window, Area } from "@reearth/beta/ui/layout";

import { useMapPage } from "./context";
import InspectorPanel from "./InspectorPanel";
import LayersPanel from "./LayersPanel";
import LayerStylePanel from "./LayerStylePanel";
import ScenePanel from "./ScenePanel";
import ToolsPanel from "./ToolsPanel";

const Map: FC = () => {
  const windowRef = useRef<HTMLDivElement>(null);

  const { onVisualizerResize } = useMapPage();

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area direction="column" resizableEdge="right" storageId="editor-map-left-area">
          <ScenePanel />
          <LayersPanel />
        </Area>
        <Area direction="column" extend asWrapper>
          <Area height={34}>
            <ToolsPanel />
          </Area>
          <Area extend onResize={onVisualizerResize} windowRef={windowRef} passive />
          <Area resizableEdge="top" storageId="editor-map-bottom-area">
            <LayerStylePanel />
          </Area>
        </Area>
        <Area direction="column" resizableEdge="left" storageId="editor-map-right-area">
          <InspectorPanel />
        </Area>
      </Area>
    </Window>
  );
};

export default Map;
