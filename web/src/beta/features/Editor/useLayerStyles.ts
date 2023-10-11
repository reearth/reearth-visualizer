import { useCallback, useMemo, useState } from "react";

import { LayerAppearanceTypes } from "@reearth/beta/lib/core/mantle";
import { useLayerStylesFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";

type useLayerStyleProps = {
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

export default function ({ sceneId }: useLayerStyleProps) {
  const t = useT();
  const { useAddLayerStyle, useGetLayerStylesQuery, useRemoveLayerStyle, useUpdateLayerStyle } =
    useLayerStylesFetcher();
  const [selectedLayerStyleId, setSelectedLayerStyleId] = useState<string | undefined>(undefined);
  const { layerStyles = [] } = useGetLayerStylesQuery({ sceneId });

  const selectedLayerStyle = useMemo(
    () => layerStyles.find(l => l.id === selectedLayerStyleId) || undefined,
    [layerStyles, selectedLayerStyleId],
  );

  const handleLayerStyleSelect = useCallback(
    (layerId: string) =>
      setSelectedLayerStyleId(prevId => (prevId === layerId ? undefined : layerId)),
    [],
  );

  const handleLayerStyleDelete = useCallback(
    async (styleId: string) => {
      if (!selectedLayerStyle) return;
      const deletedPageIndex = layerStyles.findIndex(l => l.id === styleId);

      await useRemoveLayerStyle({
        styleId: selectedLayerStyle.id,
      });
      if (styleId === selectedLayerStyleId) {
        setSelectedLayerStyleId(
          layerStyles[deletedPageIndex + 1]?.id ?? layerStyles[deletedPageIndex - 1]?.id,
        );
      }
    },
    [layerStyles, selectedLayerStyle, selectedLayerStyleId, useRemoveLayerStyle],
  );

  const handleLayerStyleAdd = useCallback(
    async (inp: LayerStyleAddProps) => {
      await useAddLayerStyle({
        sceneId: sceneId,
        name: t(inp.name),
        value: inp.value,
      });
    },
    [sceneId, t, useAddLayerStyle],
  );

  const handleLayerStyleNameUpdate = useCallback(
    async (inp: LayerStyleNameUpdateProps) => {
      await useUpdateLayerStyle({
        styleId: inp.styleId,
        name: inp.name,
      });
    },
    [useUpdateLayerStyle],
  );

  const handleLayerStyleValueUpdate = useCallback(
    async (inp: LayerStyleValueUpdateProps) => {
      await useUpdateLayerStyle({
        styleId: inp.styleId,
        value: inp.value,
      });
    },
    [useUpdateLayerStyle],
  );

  return {
    layerStyles,
    selectedLayerStyle,
    setSelectedLayerStyleId,
    handleLayerStyleAdd,
    handleLayerStyleDelete,
    handleLayerStyleSelect,
    handleLayerStyleNameUpdate,
    handleLayerStyleValueUpdate,
  };
}
