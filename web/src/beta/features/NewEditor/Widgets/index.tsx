import { FC, useRef } from "react";

import { Window, Area, type AreaSize } from "@reearth/beta/ui/layout";

type Props = {
  onVisualizerResize?: (props: AreaSize) => void;
};

const Widgets: FC<Props> = ({ onVisualizerResize }) => {
  const windowRef = useRef<HTMLDivElement>(null);

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area direction="column" extend asWrapper>
          <Area height={50}>Center-Top</Area>
          <Area extend onResize={onVisualizerResize} windowRef={windowRef} passive />
        </Area>
        <Area direction="column" resizableEdge="left">
          Right
        </Area>
      </Area>
    </Window>
  );
};

export default Widgets;
