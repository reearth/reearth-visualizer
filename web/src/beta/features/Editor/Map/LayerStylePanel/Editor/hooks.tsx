import { TabItem } from "@reearth/beta/lib/reearth-ui";
import { LayerStyle } from "@reearth/services/api/layerStyleApi/utils";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { useCallback, useEffect, useMemo, useState } from "react";

import { LayerStyleValueUpdateProps } from "../../../hooks/useLayerStyles";

import StyleCode from "./StyleCode";
import StyleInterface from "./StyleInterface";

type Props = {
  selectedLayerStyle?: LayerStyle;
  onLayerStyleValueUpdate?: (inp: LayerStyleValueUpdateProps) => void;
};

export default ({ selectedLayerStyle, onLayerStyleValueUpdate }: Props) => {
  const t = useT();
  const [, setNotification] = useNotification();

  const [layerStyle, setLayerStyle] = useState(selectedLayerStyle);

  useEffect(() => {
    setLayerStyle(selectedLayerStyle);
  }, [selectedLayerStyle]);

  const tabItems: TabItem[] = useMemo(
    () => [
      {
        id: "interface",
        name: t("Interface"),
        children: (
          <StyleInterface
            layerStyle={layerStyle}
            setLayerStyle={setLayerStyle}
            key={layerStyle?.id}
          />
        )
      },
      {
        id: "code",
        name: t("Code"),
        children: (
          <StyleCode layerStyle={layerStyle} setLayerStyle={setLayerStyle} />
        )
      }
    ],
    [layerStyle, t, setLayerStyle]
  );

  const handleSave = useCallback(() => {
    if (!layerStyle?.id) return;
    try {
      onLayerStyleValueUpdate?.({
        styleId: layerStyle.id,
        value: layerStyle?.value ?? {}
      });
    } catch (_e) {
      setNotification({ type: "error", text: t("Invalid style") });
    }
  }, [
    layerStyle?.id,
    layerStyle?.value,
    onLayerStyleValueUpdate,
    setNotification,
    t
  ]);

  return {
    tabItems,
    handleSave
  };
};
