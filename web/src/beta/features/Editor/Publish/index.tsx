import { FC, useRef } from "react";

import { Window, Area } from "@reearth/beta/ui/layout";

import { usePublishPage } from "./context";
import PublishToolsPanel from "./PublishToolsPanel";

const Publish: FC = () => {
  const windowRef = useRef<HTMLDivElement>(null);
  const { handleVisualizerResize } = usePublishPage();

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area direction="column" extend asWrapper>
          <Area initialHeight={44}>
            <PublishToolsPanel />
          </Area>
          <Area extend onResize={handleVisualizerResize} windowRef={windowRef} passive />
        </Area>
      </Area>
    </Window>
  );
};

export default Publish;
