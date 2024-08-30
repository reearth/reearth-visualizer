import { LayerAppearanceTypes } from "@reearth/core";
import { useLayerStylesFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
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
  const {
    useAddLayerStyle,
    useGetLayerStylesQuery,
    useRemoveLayerStyle,
    useUpdateLayerStyle
  } = useLayerStylesFetcher();
  const [selectedLayerStyleId, setSelectedLayerStyleId] = useState<
    string | undefined
  >(undefined);
  const { layerStyles } = useGetLayerStylesQuery({ sceneId });

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

      await useRemoveLayerStyle({
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
      useRemoveLayerStyle
    ]
  );

  const handleLayerStyleAdd = useCallback(
    async (inp: LayerStyleAddProps) => {
      await useAddLayerStyle({
        sceneId: sceneId,
        name: t(inp.name),
        value: inp.value
      });
    },
    [sceneId, t, useAddLayerStyle]
  );

  const handleLayerStyleNameUpdate = useCallback(
    async (inp: LayerStyleNameUpdateProps) => {
      await useUpdateLayerStyle({
        styleId: inp.styleId,
        name: inp.name
      });
    },
    [useUpdateLayerStyle]
  );

  const handleLayerStyleValueUpdate = useCallback(
    async (inp: LayerStyleValueUpdateProps) => {
      await useUpdateLayerStyle({
        styleId: inp.styleId,
        value: inp.value
      });
    },
    [useUpdateLayerStyle]
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
