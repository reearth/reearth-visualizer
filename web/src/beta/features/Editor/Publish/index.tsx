import { FC, useRef } from "react";

import { Window, Area } from "@reearth/beta/ui/layout";

import { usePublishPage } from "./context";
import PublishToolsPanel from "./PublishToolsPanel";

const Publish: FC = () => {
  const windowRef = useRef<HTMLDivElement>(null);
  const { onVisualizerResize } = usePublishPage();

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area direction="column" extend asWrapper>
          <Area height={34}>
            <PublishToolsPanel />
          </Area>
          <Area extend onResize={onVisualizerResize} windowRef={windowRef} passive />
        </Area>
      </Area>
    </Window>
  );
};

export default Publish;
