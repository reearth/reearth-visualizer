import { Switcher } from "@reearth/beta/lib/reearth-ui";
import { MarkerAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { FC, useCallback, useEffect, useState } from "react";

import { LayerStyleProps } from "../../InterfaceTab";
import NodeSystem from "../../NodeSystem";

const ShowNode: FC<LayerStyleProps> = ({ layerStyle, setLayerStyle }) => {
  const [value, setValue] = useState<MarkerAppearance["show"]>(
    layerStyle?.value.marker?.show ?? false
  );
  const t = useT();
  const [, setNotification] = useNotification();

  useEffect(() => {
    if (layerStyle?.value.marker?.show)
      setValue(layerStyle?.value.marker?.show);
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
              show: value
            }
          }
        };
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [setLayerStyle, setNotification, setValue, t, value]);

  const handleChange = useCallback((value: boolean) => {
    setValue?.(value);
  }, []);

  return (
    <NodeSystem title="Show">
      <Switcher value={value} onChange={handleChange} />
    </NodeSystem>
  );
};

export default ShowNode;
