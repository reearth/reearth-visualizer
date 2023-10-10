import { useCallback, useMemo, useState } from "react";

import { LayerSimple } from "@reearth/beta/lib/core/Map";
import { useLayersFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";

type useLayerProps = {
  sceneId: string;
};

export type LayerAddProps = {
  config?: Omit<LayerSimple, "type" | "id">;
  index?: any;
  layerType: string;
  sceneId: string;
  title: string;
  visible?: boolean;
};

export type LayerNameUpdateProps = {
  layerId: string;
  name: string;
};

export type LayerConfigUpdateProps = {
  layerId: string;
  config: Omit<LayerSimple, "type" | "id">;
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
    async (inp: LayerNameUpdateProps) => {
      await useUpdateNLSLayer({
        layerId: inp.layerId,
        name: inp.name,
      });
    },
    [useUpdateNLSLayer],
  );

  const handleLayerConfigUpdate = useCallback(
    async (inp: LayerConfigUpdateProps) => {
      await useUpdateNLSLayer({
        layerId: inp.layerId,
        config: inp.config,
      });
    },
    [useUpdateNLSLayer],
  );

  return {
    nlsLayers,
    selectedLayer,
    setSelectedLayerId,
    handleLayerAdd,
    handleLayerDelete,
    handleLayerSelect,
    handleLayerNameUpdate,
    handleLayerConfigUpdate,
  };
}
