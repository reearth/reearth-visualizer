import { NumberInput } from "@reearth/beta/lib/reearth-ui";
import { MarkerAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { FC, useEffect, useState } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import NodeSystem from "../../NodeSystem";

const HeightNode: FC<LayerStyleProps> = ({ layerStyle, setLayerStyle }) => {
  const [value, setValue] = useState<MarkerAppearance["height"]>(
    layerStyle?.value.marker?.height ?? 0
  );
  const t = useT();
  const [, setNotification] = useNotification();

  useEffect(() => {
    if (layerStyle?.value.marker?.height)
      setValue(layerStyle?.value.marker?.height);
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
              height: value
            }
          }
        };
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [setLayerStyle, setNotification, setValue, t, value]);

  return (
    <NodeSystem title="Height">
      <NumberInput value={value} onChange={setValue} />
    </NodeSystem>
  );
};

export default HeightNode;
