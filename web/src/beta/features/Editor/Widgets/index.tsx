import { Window, Area, AreaRef } from "@reearth/beta/ui/layout";
import { FC, useRef } from "react";

import ContainerSettingsPanel from "./ContainerSettingsPanel";
import { useWidgetsPage } from "./context";
import WASToolsPanel from "./WASToolsPanel";
import WidgetInspectorPanel from "./WidgetInspectorPanel";
import WidgetManagerPanel from "./WidgetManagerPanel";

const Widgets: FC = () => {
  const { handleVisualizerResize, selectedWidgetArea, selectedWidget } =
    useWidgetsPage();

  const windowRef = useRef<HTMLDivElement>(null);
  const rightAreaRef = useRef<AreaRef>(null);

  return (
    <Window ref={windowRef} data-testid="widgets-window">
      <Area extend asWrapper data-testid="widgets-main-area">
        <Area
          direction="column"
          extend
          asWrapper
          data-testid="widgets-left-area"
        >
          <Area initialHeight={34} data-testid="widgets-tools-area">
            <WASToolsPanel />
          </Area>
          <Area
            extend
            onResize={handleVisualizerResize}
            windowRef={windowRef}
            passive
            data-testid="widgets-visualizer-area"
          />
        </Area>
        <Area
          direction="column"
          resizableEdge="left"
          storageId="editor-widgets-right-area"
          ref={rightAreaRef}
          data-testid="widgets-right-area"
        >
          <WidgetManagerPanel showCollapseArea areaRef={rightAreaRef} />
          {selectedWidget && <WidgetInspectorPanel />}
          {selectedWidgetArea && <ContainerSettingsPanel />}
        </Area>
      </Area>
    </Window>
  );
};

export default Widgets;
