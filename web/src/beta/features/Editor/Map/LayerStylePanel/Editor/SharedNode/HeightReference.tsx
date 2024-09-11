import { Selector } from "@reearth/beta/lib/reearth-ui";
import { MarkerAppearance } from "@reearth/core";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { FC, useCallback, useEffect, useState } from "react";

import { LayerStyleProps } from "../InterfaceTab";
import NodeSystem from "../NodeSystem";


const options = [
  {
    value: "none",
    label: "none"
  },
  {
    value: "clamp",
    label: "clamp"
  },
  {
    value: "relative",
    label: "relative"
  }
];

const HeightReferenceNode: FC<
  LayerStyleProps & {
    styleType: "marker" | "polyline" | "polygon" | "threedtiles" | "model";
  }
> = ({ layerStyle, styleType, setLayerStyle }) => {
  const [heightReferenceValue, setStyleHeightReferenceValue] = useState<
    MarkerAppearance["heightReference"]
  >(layerStyle?.value.marker?.heightReference ?? "none");

  const t = useT();
  const [, setNotification] = useNotification();

  const handleChange = useCallback((value: string | string[]) => {
    if (typeof value !== "string") return;
    setStyleHeightReferenceValue?.(
      value as MarkerAppearance["heightReference"]
    );
  }, []);

  useEffect(() => {
    if (layerStyle?.value.marker?.heightReference)
      setStyleHeightReferenceValue(layerStyle?.value.marker?.heightReference);
  }, [layerStyle]);

  useEffect(() => {
    try {
      setLayerStyle((prev) => {
        if (!prev?.id) return prev;
        return {
          ...prev,
          value: {
            ...prev.value,
            [styleType]: {
              ...prev.value?.[styleType],
              heightReference: heightReferenceValue
            }
          }
        };
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [setLayerStyle, setNotification, heightReferenceValue, t, styleType]);

  return (
    <NodeSystem title="HeightReference">
      <Selector
        value={heightReferenceValue}
        options={options}
        onChange={handleChange}
      />
    </NodeSystem>
  );
};

export default HeightReferenceNode;
