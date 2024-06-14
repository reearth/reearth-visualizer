import { FC, useRef } from "react";

import { Window, Area, type AreaSize } from "@reearth/beta/ui/layout";

import LayersPanel from "./LayersPanel";
import SceneInspectorPanel from "./SceneInspectorPanel";
import ScenePanel from "./ScenePanel";
import StylesPanel from "./StylesPanel";
import ToolsPanel from "./ToolsPanel";

type Props = {
  onVisualizerResize?: (props: AreaSize) => void;
};

const Map: FC<Props> = ({ onVisualizerResize }) => {
  const windowRef = useRef<HTMLDivElement>(null);

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area direction="column" resizableEdge="right" storageId="editor-map-left-area">
          <ScenePanel />
          <LayersPanel />
        </Area>
        <Area direction="column" extend asWrapper>
          <Area height={36}>
            <ToolsPanel />
          </Area>
          <Area extend onResize={onVisualizerResize} windowRef={windowRef} passive />
          <Area resizableEdge="top" storageId="editor-map-bottom-area">
            <StylesPanel />
          </Area>
        </Area>
        <Area direction="column" resizableEdge="left" storageId="editor-map-right-area">
          <SceneInspectorPanel />
        </Area>
      </Area>
    </Window>
  );
};

export default Map;
