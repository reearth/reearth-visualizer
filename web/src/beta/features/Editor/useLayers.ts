import { useCallback, useMemo, useState } from "react";

import { useLayersFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";

type useLayerProps = {
  sceneId: string;
};

export type LayerAddProps = {
  config?: any;
  index?: any;
  layerType: string;
  sceneId: string;
  title: string;
  visible?: boolean;
};

export type LayerUpdateProps = {
  layerId: string;
  name?: string;
  visible?: boolean;
};

export default function ({ sceneId }: useLayerProps) {
  const t = useT();
  const { useGetLayersQuery, useAddNLSLayerSimple, useRemoveNLSLayer, useUpdateNLSLayer } =
    useLayersFetcher();
  const [selectedLayerId, setSelectedLayerId] = useState<string | undefined>(undefined);
  const { nlsLayers = [] } = useGetLayersQuery({ sceneId });

  const selectedLayer = useMemo(
    () => nlsLayers.find(l => l.id === selectedLayerId) || undefined,
    [nlsLayers, selectedLayerId],
  );

  const handleLayerSelect = useCallback(
    (layerId: string) => setSelectedLayerId(prevId => (prevId === layerId ? undefined : layerId)),
    [],
  );

  const handleLayerDelete = useCallback(
    async (layerId: string) => {
      if (!selectedLayer) return;
      const deletedPageIndex = nlsLayers.findIndex(l => l.id === layerId);

      await useRemoveNLSLayer({
        layerId: selectedLayer.id,
      });
      if (layerId === selectedLayerId) {
        setSelectedLayerId(
          nlsLayers[deletedPageIndex + 1]?.id ?? nlsLayers[deletedPageIndex - 1]?.id,
        );
      }
    },
    [nlsLayers, selectedLayer, selectedLayerId, useRemoveNLSLayer],
  );

  const handleLayerAdd = useCallback(
    async (inp: LayerAddProps) => {
      await useAddNLSLayerSimple({
        sceneId: inp.sceneId,
        config: inp.config,
        visible: inp.visible,
        layerType: inp.layerType,
        title: t(inp.title),
        index: inp.index,
      });
    },
    [t, useAddNLSLayerSimple],
  );

  const handleLayerNameUpdate = useCallback(
    async (inp: LayerUpdateProps) => {
      await useUpdateNLSLayer({
        layerId: inp.layerId,
        name: inp.name,
      });
    },
    [useUpdateNLSLayer],
  );

  const handleLayerVisibilityUpdate = useCallback(
    async (inp: LayerUpdateProps) => {
      await useUpdateNLSLayer({
        layerId: inp.layerId,
        visible: inp.visible,
      });
    },
    [useUpdateNLSLayer],
  );

  return {
    nlsLayers,
    selectedLayer,
    handleLayerAdd,
    handleLayerDelete,
    handleLayerSelect,
    handleLayerNameUpdate,
    handleLayerVisibilityUpdate,
  };
}
