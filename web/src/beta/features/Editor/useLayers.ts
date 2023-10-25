import { useReactiveVar } from "@apollo/client";
import { useCallback, useMemo } from "react";

import { LayerSimple } from "@reearth/beta/lib/core/Map";
import { useLayersFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { selectedLayerVar } from "@reearth/services/state";

type LayerProps = {
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

export type LayerVisibilityUpdateProps = {
  layerId: string;
  visible: boolean;
};

export default function ({ sceneId }: LayerProps) {
  const t = useT();
  const { useGetLayersQuery, useAddNLSLayerSimple, useRemoveNLSLayer, useUpdateNLSLayer } =
    useLayersFetcher();
  const { nlsLayers = [] } = useGetLayersQuery({ sceneId });

  const selectedLayerId = useReactiveVar(selectedLayerVar);

  const selectedLayer = useMemo(
    () => nlsLayers.find(l => l.id === selectedLayerId?.layerId) || undefined,
    [nlsLayers, selectedLayerId],
  );

  const handleLayerSelect = useCallback(
    (layerId?: string) => {
      selectedLayerVar(layerId && layerId !== selectedLayerId?.layerId ? { layerId } : undefined);
    },
    [selectedLayerId?.layerId],
  );

  const handleLayerDelete = useCallback(
    async (layerId: string) => {
      if (!selectedLayer) return;
      const deletedPageIndex = nlsLayers.findIndex(l => l.id === layerId);

      await useRemoveNLSLayer({
        layerId: selectedLayer.id,
      });
      if (layerId === selectedLayerId?.layerId) {
        handleLayerSelect(
          nlsLayers[deletedPageIndex + 1]?.id ?? nlsLayers[deletedPageIndex - 1]?.id,
        );
      }
    },
    [nlsLayers, selectedLayer, selectedLayerId, handleLayerSelect, useRemoveNLSLayer],
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
  const handleLayerVisibilityUpdate = useCallback(
    async (inp: LayerVisibilityUpdateProps) => {
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
    handleLayerSelect,
    handleLayerAdd,
    handleLayerDelete,
    handleLayerNameUpdate,
    handleLayerConfigUpdate,
    handleLayerVisibilityUpdate,
  };
}
