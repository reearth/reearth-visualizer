import { Selector } from "@reearth/beta/lib/reearth-ui";
import { FC, useCallback, useState } from "react";

import NodeSystem from "../NodeSystem";

const options = [
  {
    value: "none",
    label: "none"
  },
  {
    value: "point",
    label: "point"
  },
  {
    value: "image",
    label: "image"
  }
];

const StylesNode: FC = () => {
  const [styleValue, setStyleValue] = useState("none");

  const handleChange = useCallback((value: string | string[]) => {
    if (typeof value !== "string") return;
    setStyleValue?.(value);
  }, []);

  return (
    <NodeSystem title="Style">
      <Selector value={styleValue} options={options} onChange={handleChange} />
    </NodeSystem>
  );
};

export default StylesNode;
