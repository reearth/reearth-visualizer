import { FC, useRef } from "react";

import { Window, Area, type AreaSize } from "@reearth/beta/ui/layout";

type Props = {
  onVisualizerResize?: (props: AreaSize) => void;
};

const Story: FC<Props> = ({ onVisualizerResize }) => {
  const windowRef = useRef<HTMLDivElement>(null);

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area direction="column" resizableEdge="right">
          Left
        </Area>
        <Area
          direction="column"
          extend
          onResize={onVisualizerResize}
          windowRef={windowRef}
          passive
        />
        <Area direction="column" resizableEdge="left">
          Right
        </Area>
      </Area>
    </Window>
  );
};

export default Story;
