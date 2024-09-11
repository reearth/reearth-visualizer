import { ColorInput } from "@reearth/beta/lib/reearth-ui";
import { MarkerAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { FC, useEffect, useState } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import NodeSystem from "../../NodeSystem";

const PointColorNode: FC<LayerStyleProps> = ({ layerStyle, setLayerStyle }) => {
  const [value, setValue] = useState<MarkerAppearance["pointColor"]>(
    layerStyle?.value.marker?.pointColor ?? null
  );
  const t = useT();
  const [, setNotification] = useNotification();

  useEffect(() => {
    if (layerStyle?.value.marker?.pointColor)
      setValue(layerStyle?.value.marker?.pointColor);
  }, [layerStyle]);

  useEffect(() => {
    try {
      setLayerStyle((prev) => {
        if (!prev?.id) return prev;
        return {
          ...prev,
          value: {
            ...prev.value,
            marker: {
              ...prev.value?.marker,
              pointColor: value
            }
          }
        };
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [setLayerStyle, setNotification, setValue, t, value]);

  return (
    <NodeSystem title="PointColor">
      <ColorInput value={value} onChange={setValue} />
    </NodeSystem>
  );
};

export default PointColorNode;
