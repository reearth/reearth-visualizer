import { FC, useRef } from "react";

import { Window, Area } from "@reearth/beta/ui/layout";

import ContainerSettingsPanel from "./ContainerSettingsPanel";
import WASToolsPanel from "./WASToolsPanel";
import WidgetInspectorPanel from "./WidgetInspectorPanel";
import WidgetManagerPanel from "./WidgetManagerPanel";
import { useWidgetsPage } from "./widgetsPageContext";

type Props = {};

const Widgets: FC<Props> = () => {
  const windowRef = useRef<HTMLDivElement>(null);

  const { onVisualizerResize, selectedWidgetArea, selectedWidget } = useWidgetsPage();

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area direction="column" extend asWrapper>
          <Area height={34}>
            <WASToolsPanel />
          </Area>
          <Area extend onResize={onVisualizerResize} windowRef={windowRef} passive />
        </Area>
        <Area direction="column" resizableEdge="left" storageId="editor-widgets-right-area">
          <WidgetManagerPanel />
          {selectedWidget && <WidgetInspectorPanel />}
          {selectedWidgetArea && <ContainerSettingsPanel />}
        </Area>
      </Area>
    </Window>
  );
};

export default Widgets;
