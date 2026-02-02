import { LayerAppearanceTypes } from "@reearth/core";
import {
  useLayerStyleMutations,
  useLayerStyles
} from "@reearth/services/api/layerStyle";
import { useT } from "@reearth/services/i18n/hooks";
import { useCallback, useMemo, useState } from "react";

type LayerStyleProps = {
  sceneId: string;
};

export type LayerStyleAddProps = {
  name: string;
  value?: Partial<LayerAppearanceTypes>;
};

export type LayerStyleNameUpdateProps = {
  styleId: string;
  name: string;
};

export type LayerStyleValueUpdateProps = {
  styleId: string;
  value: Partial<LayerAppearanceTypes>;
};

export default function ({ sceneId }: LayerStyleProps) {
  const t = useT();
  const { addLayerStyle, removeLayerStyle, updateLayerStyle } =
    useLayerStyleMutations();
  const [selectedLayerStyleId, setSelectedLayerStyleId] = useState<
    string | undefined
  >(undefined);
  const { layerStyles } = useLayerStyles({ sceneId });

  const selectedLayerStyle = useMemo(
    () => layerStyles.find((l) => l.id === selectedLayerStyleId) || undefined,
    [layerStyles, selectedLayerStyleId]
  );

  const handleLayerStyleSelect = useCallback(
    (layerId: string | undefined) => setSelectedLayerStyleId(layerId),
    [setSelectedLayerStyleId]
  );

  const handleLayerStyleDelete = useCallback(
    async (styleId: string) => {
      const deletedPageIndex = layerStyles.findIndex((l) => l.id === styleId);
      if (deletedPageIndex === undefined) return;

      await removeLayerStyle({
        styleId
      });
      if (styleId === selectedLayerStyleId) {
        setSelectedLayerStyleId(undefined);
      }
    },
    [
      layerStyles,
      selectedLayerStyleId,
      setSelectedLayerStyleId,
      removeLayerStyle
    ]
  );

  const handleLayerStyleAdd = useCallback(
    async (inp: LayerStyleAddProps) => {
      await addLayerStyle({
        sceneId: sceneId,
        name: t(inp.name),
        value: inp.value
      });
    },
    [sceneId, t, addLayerStyle]
  );

  const handleLayerStyleNameUpdate = useCallback(
    async (inp: LayerStyleNameUpdateProps) => {
      await updateLayerStyle({
        styleId: inp.styleId,
        name: inp.name
      });
    },
    [updateLayerStyle]
  );

  const handleLayerStyleValueUpdate = useCallback(
    async (inp: LayerStyleValueUpdateProps) => {
      await updateLayerStyle({
        styleId: inp.styleId,
        value: inp.value
      });
    },
    [updateLayerStyle]
  );

  return {
    layerStyles,
    selectedLayerStyle,
    handleLayerStyleAdd,
    handleLayerStyleDelete,
    handleLayerStyleSelect,
    handleLayerStyleNameUpdate,
    handleLayerStyleValueUpdate
  };
}
