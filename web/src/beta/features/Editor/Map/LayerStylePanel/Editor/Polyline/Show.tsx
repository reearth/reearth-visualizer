import { Switcher } from "@reearth/beta/lib/reearth-ui";
import { FC, useCallback, useState } from "react";

import NodeSystem from "../NodeSystem";

const ShowNode: FC = () => {
  const [styleValue, setStyleValue] = useState(false);

  const handleChange = useCallback((value: boolean) => {
    setStyleValue?.(value);
  }, []);

  return (
    <NodeSystem title="Style">
      <Switcher value={styleValue} onChange={handleChange} />
    </NodeSystem>
  );
};

export default ShowNode;
