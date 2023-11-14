import { MutableRefObject, useCallback, useMemo } from "react";

import { MapRef } from "@reearth/beta/lib/core/Crust/types";
import { LayerSimple } from "@reearth/beta/lib/core/Map";
import { useLayersFetcher } from "@reearth/services/api";
import { useT } from "@reearth/services/i18n";
import { useSelectedLayer } from "@reearth/services/state";

type LayerProps = {
  sceneId: string;
  isVisualizerReady?: boolean;
  visualizerRef?: MutableRefObject<MapRef | null>;
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

export default function ({ sceneId, isVisualizerReady, visualizerRef }: LayerProps) {
  const t = useT();
  const { useGetLayersQuery, useAddNLSLayerSimple, useRemoveNLSLayer, useUpdateNLSLayer } =
    useLayersFetcher();
  const { nlsLayers = [] } = useGetLayersQuery({ sceneId });

  const [selectedLayerId, setSelectedLayerId] = useSelectedLayer();

  const selectedLayer = useMemo(
    () => nlsLayers.find(l => l.id === selectedLayerId?.layerId) || undefined,
    [nlsLayers, selectedLayerId],
  );

  const handleLayerSelect = useCallback(
    (layerId?: string) => {
      if (!isVisualizerReady) return;

      if (layerId && layerId !== selectedLayerId?.layerId) {
        setSelectedLayerId({ layerId });
      } else {
        setSelectedLayerId(undefined);
      }
      // lib/core doesn't support selecting a layer without auto-selecting a feature, so
      // Either way, we want to deselect from core as we are either deselecting, or changing to a new layer
      visualizerRef?.current?.layers.select(undefined);
    },
    [selectedLayerId?.layerId, isVisualizerReady, visualizerRef, setSelectedLayerId],
  );

  const handleLayerDelete = useCallback(
    async (layerId: string) => {
      const deletedPageIndex = nlsLayers.findIndex(l => l.id === layerId);
      if (deletedPageIndex === undefined) return;

      await useRemoveNLSLayer({
        layerId,
      });
      if (layerId === selectedLayerId?.layerId) {
        handleLayerSelect(
          nlsLayers[deletedPageIndex + 1]?.id ?? nlsLayers[deletedPageIndex - 1]?.id,
        );
      }
    },
    [nlsLayers, selectedLayerId, handleLayerSelect, useRemoveNLSLayer],
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
