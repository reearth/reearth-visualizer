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
