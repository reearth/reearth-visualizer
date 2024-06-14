import { FC, useRef } from "react";

import { Window, Area, type AreaSize } from "@reearth/beta/ui/layout";

type Props = {
  onVisualizerResize?: (props: AreaSize) => void;
};

const Publish: FC<Props> = ({ onVisualizerResize }) => {
  const windowRef = useRef<HTMLDivElement>(null);

  return (
    <Window ref={windowRef}>
      <Area extend asWrapper>
        <Area direction="column" extend asWrapper>
          <Area height={100}>Center-Top</Area>
          <Area extend onResize={onVisualizerResize} windowRef={windowRef} passive />
        </Area>
      </Area>
    </Window>
  );
};

export default Publish;
