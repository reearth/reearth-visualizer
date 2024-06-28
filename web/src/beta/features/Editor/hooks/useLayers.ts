import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MapRef, ComputedFeature, ComputedLayer, LayerSimple } from "@reearth/core";
import { useLayersFetcher } from "@reearth/services/api";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";

type LayerProps = {
  sceneId: string;
  isVisualizerReady?: boolean;
  visualizerRef?: MutableRefObject<MapRef | null>;
};

export type LayerSelectProps =
  | {
      layerId?: string;
      computedLayer?: ComputedLayer;
      computedFeature?: ComputedFeature;
    }
  | undefined;

export type LayerAddProps = {
  config?: Omit<LayerSimple, "type" | "id">;
  index?: any;
  layerType: string;
  sceneId: string;
  title: string;
  visible?: boolean;
  schema?: any;
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

export type LayerMoveProps = {
  layerId: string;
  index: number;
};

export type SelectedLayer = {
  layer?: NLSLayer;
  computedLayer?: ComputedLayer;
  computedFeature?: ComputedFeature;
};

export default function ({ sceneId, isVisualizerReady, visualizerRef }: LayerProps) {
  const t = useT();
  const { useGetLayersQuery, useAddNLSLayerSimple, useRemoveNLSLayer, useUpdateNLSLayer } =
    useLayersFetcher();

  const { nlsLayers: originNlsLayers } = useGetLayersQuery({ sceneId });

  // TODO: support by gql mutation
  const [sortedLayerIds, setSortedLayerIds] = useState<string[]>([]);

  useEffect(() => {
    if (!originNlsLayers) return;
    setSortedLayerIds(prev => (prev.length > 0 ? prev : originNlsLayers.map(l => l.id)));
  }, [originNlsLayers]);

  const nlsLayers: NLSLayer[] = useMemo(
    () =>
      originNlsLayers
        ? [
            ...(sortedLayerIds
              .map(id => originNlsLayers.find(l => l.id === id))
              .filter(Boolean) as NLSLayer[]),
            ...originNlsLayers.filter(l => !sortedLayerIds.includes(l.id)),
          ]
        : [],
    [originNlsLayers, sortedLayerIds],
  );

  const [selectedLayer, setSelectedLayer] = useState<SelectedLayer | undefined>();

  const handleLayerSelect = useCallback(
    (props: LayerSelectProps) => {
      if (!isVisualizerReady) return;

      // later core unselect is effecting this select, so we need to delay it.
      setTimeout(() => {
        if (props?.layerId) {
          setSelectedLayer({
            layer: nlsLayers.find(l => l.id === props.layerId),
            computedLayer: props?.computedLayer,
            computedFeature: props?.computedFeature,
          });
        } else {
          setSelectedLayer(undefined);
        }
      }, 1);

      // Layer selection does not specific any feature, we do unselect for core.
      visualizerRef?.current?.layers.select(undefined);
    },
    [isVisualizerReady, visualizerRef, nlsLayers],
  );

  // Workaround: core will trigger a select undefined after sketch layer add feature.
  const ignoreCoreLayerUnselect = useRef(false);

  const handleCoreLayerSelect = useCallback(
    (props: LayerSelectProps) => {
      if (!isVisualizerReady) return;

      if (!props?.layerId && !selectedLayer?.layer?.id) {
        return;
      }

      if (ignoreCoreLayerUnselect.current && !props?.layerId) {
        ignoreCoreLayerUnselect.current = false;
        return;
      }

      if (props?.layerId) {
        setSelectedLayer({
          layer: nlsLayers.find(l => l.id === props.layerId),
          computedLayer: props?.computedLayer,
          computedFeature: props?.computedFeature,
        });
      } else {
        setSelectedLayer(undefined);
      }
    },
    [isVisualizerReady, nlsLayers, selectedLayer],
  );

  const handleLayerDelete = useCallback(
    async (layerId: string) => {
      const deletedPageIndex = nlsLayers.findIndex(l => l.id === layerId);
      if (deletedPageIndex === undefined) return;

      await useRemoveNLSLayer({
        layerId,
      });
      if (layerId === selectedLayer?.layer?.id) {
        handleLayerSelect(undefined);
      }
      setSortedLayerIds(prev => {
        const newSortedLayerIds = [...prev];
        newSortedLayerIds.splice(deletedPageIndex, 1);
        return newSortedLayerIds;
      });
    },
    [nlsLayers, selectedLayer, handleLayerSelect, useRemoveNLSLayer],
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
        schema: inp.schema,
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

  useEffect(() => {
    setSelectedLayer(prev => {
      if (prev?.layer) {
        const layer = nlsLayers.find(l => l.id === prev.layer?.id);
        return layer
          ? {
              ...prev,
              layer,
            }
          : undefined;
      }
      return prev;
    });
  }, [nlsLayers]);

  // TODO: support by gql mutation
  const handleLayerMove = useCallback((inp: LayerMoveProps) => {
    setSortedLayerIds(prev => {
      const newSortedLayerIds = [...prev];
      const index = newSortedLayerIds.indexOf(inp.layerId);
      if (index !== -1) {
        newSortedLayerIds.splice(index, 1);
        newSortedLayerIds.splice(inp.index, 0, inp.layerId);
      }
      return newSortedLayerIds;
    });
  }, []);

  return {
    nlsLayers,
    selectedLayer,
    ignoreCoreLayerUnselect,
    handleLayerSelect,
    handleCoreLayerSelect,
    handleLayerAdd,
    handleLayerDelete,
    handleLayerNameUpdate,
    handleLayerConfigUpdate,
    handleLayerVisibilityUpdate,
    handleLayerMove,
  };
}
