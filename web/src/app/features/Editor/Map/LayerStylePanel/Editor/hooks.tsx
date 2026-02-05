import { TabItem } from "@reearth/app/lib/reearth-ui";
import type { LayerStyle } from "@reearth/services/api/layerStyle";
import { useT } from "@reearth/services/i18n/hooks";
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
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setLayerStyle(selectedLayerStyle);
  }, [selectedLayerStyle]);

  useEffect(() => {
    if (!selectedLayerStyle) setEditMode(false);
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
            editMode={editMode}
            data-testid="style-interface"
          />
        )
      },
      {
        id: "code",
        name: t("Code"),
        children: (
          <StyleCode
            layerStyle={layerStyle}
            setLayerStyle={setLayerStyle}
            editMode={editMode}
            data-testid="style-code"
          />
        )
      }
    ],
    [t, layerStyle, editMode]
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
    setEditMode(false);
  }, [
    layerStyle?.id,
    layerStyle?.value,
    onLayerStyleValueUpdate,
    setNotification,
    t
  ]);

  const handleEditLayerStyle = useCallback(() => {
    setEditMode(true);
  }, []);

  const handleCancelLayerStyle = useCallback(() => {
    setEditMode(false);
    setLayerStyle(selectedLayerStyle);
  }, [selectedLayerStyle]);

  return {
    tabItems,
    editMode,
    handleSave,
    handleEditLayerStyle,
    handleCancelLayerStyle
  };
};
