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
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area direction="column" extend asWrapper>
          <Area initialHeight={34}>
            <WASToolsPanel />
          </Area>
          <Area
            extend
            onResize={handleVisualizerResize}
            windowRef={windowRef}
            passive
          />
        </Area>
        <Area
          direction="column"
          resizableEdge="left"
          storageId="editor-widgets-right-area"
          ref={rightAreaRef}
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
