import type {
  MapRef,
  ComputedFeature,
  ComputedLayer,
  LayerSimple,
  Geometry
} from "@reearth/core";
import { useLayersFetcher } from "@reearth/services/api";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import {
  ChangeCustomPropertyTitleInput,
  RemoveCustomPropertyInput,
  UpdateCustomPropertySchemaInput
} from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

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

export type SelectedFeature = {
  id: string;
  geometry: Geometry | undefined;
  properties: ComputedFeature["properties"];
};

export default function ({
  sceneId,
  isVisualizerReady,
  visualizerRef
}: LayerProps) {
  const t = useT();
  const {
    useGetLayersQuery,
    useAddNLSLayerSimple,
    useRemoveNLSLayer,
    useUpdateNLSLayer,
    useUpdateNLSLayers,
    useUpdateCustomProperties,
    useChangeCustomPropertyTitle,
    useRemoveCustomProperty
  } = useLayersFetcher();

  const { nlsLayers: originNlsLayers } = useGetLayersQuery({ sceneId });

  const [sortedLayerIds, setSortedLayerIds] = useState<string[]>([]);

  useEffect(() => {
    if (!originNlsLayers) return;

    setSortedLayerIds((prev) => {
      const originIds = originNlsLayers.map((l) => l.id);
      if (
        prev.length === originIds.length &&
        prev.every((id, idx) => id === originIds[idx])
      ) {
        return prev;
      }
      return [...originNlsLayers]
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .map((l) => l.id);
    });
  }, [originNlsLayers]);

  const nlsLayers: NLSLayer[] = useMemo(
    () =>
      originNlsLayers
        ? [
            ...(sortedLayerIds
              .map((id) => originNlsLayers.find((l) => l.id === id))
              .filter(Boolean) as NLSLayer[]),
            ...originNlsLayers.filter((l) => !sortedLayerIds.includes(l.id))
          ]
        : [],
    [originNlsLayers, sortedLayerIds]
  );

  const [selectedLayer, setSelectedLayer] = useState<
    SelectedLayer | undefined
  >();
  const [layerId, setLayerId] = useState<string | undefined>();

  const handleLayerSelect = useCallback(
    (props: LayerSelectProps) => {
      if (!isVisualizerReady) return;

      // later core unselect is effecting this select, so we need to delay it.
      setTimeout(() => {
        if (props?.layerId) {
          setSelectedLayer({
            layer: nlsLayers.find((l) => l.id === props.layerId),
            computedLayer: props?.computedLayer,
            computedFeature: props?.computedFeature
          });
        } else {
          setSelectedLayer(undefined);
        }
      }, 1);

      // Layer selection does not specific any feature, we do unselect for core.
      visualizerRef?.current?.layers.select(undefined);
    },
    [isVisualizerReady, visualizerRef, nlsLayers]
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
          layer: nlsLayers.find((l) => l.id === props.layerId),
          computedLayer: props?.computedLayer,
          computedFeature: props?.computedFeature
        });
      } else {
        setSelectedLayer(undefined);
      }
    },
    [isVisualizerReady, nlsLayers, selectedLayer]
  );

  const handleLayerDelete = useCallback(
    async (layerId: string) => {
      const deletedPageIndex = nlsLayers.findIndex((l) => l.id === layerId);
      if (deletedPageIndex === undefined) return;

      await useRemoveNLSLayer({
        layerId
      });
      if (layerId === selectedLayer?.layer?.id) {
        handleLayerSelect(undefined);
      }
      setSortedLayerIds((prev) => {
        const newSortedLayerIds = [...prev];
        newSortedLayerIds.splice(deletedPageIndex, 1);
        return newSortedLayerIds;
      });
    },
    [nlsLayers, selectedLayer, handleLayerSelect, useRemoveNLSLayer]
  );

  const selectedFeature: SelectedFeature | undefined = useMemo(() => {
    if (!selectedLayer?.computedFeature?.id) return;
    const { id, geometry, properties } =
      selectedLayer.layer?.config?.data?.type === "3dtiles" ||
      selectedLayer.layer?.config?.data?.type === "osm-buildings" ||
      selectedLayer.layer?.config?.data?.type === "google-photorealistic" ||
      selectedLayer.layer?.config?.data?.type === "mvt"
        ? selectedLayer.computedFeature
        : (selectedLayer.computedLayer?.features?.find(
            (f) => f.id === selectedLayer.computedFeature?.id
          ) ?? {});

    if (!id) return;
    return {
      id,
      geometry,
      properties
    };
  }, [selectedLayer]);

  const handleLayerAdd = useCallback(
    async (inp: LayerAddProps) => {
      const maxIndex: number = nlsLayers.reduce(
        (max: number, layer: NLSLayer) =>
          layer.index != null ? Math.max(max, layer.index) : max,
        -1
      );

      const nextIndex = maxIndex + 1;

      await useAddNLSLayerSimple({
        sceneId: inp.sceneId,
        config: inp.config,
        visible: inp.visible,
        layerType: inp.layerType,
        title: t(inp.title),
        index: nextIndex,
        schema: inp.schema
      });
    },
    [nlsLayers, t, useAddNLSLayerSimple]
  );

  const handleLayerNameUpdate = useCallback(
    async (inp: LayerNameUpdateProps) => {
      await useUpdateNLSLayer({
        layerId: inp.layerId,
        name: inp.name
      });
    },
    [useUpdateNLSLayer]
  );

  const handleLayerConfigUpdate = useCallback(
    async (inp: LayerConfigUpdateProps) => {
      await useUpdateNLSLayer({
        layerId: inp.layerId,
        config: inp.config
      });
    },
    [useUpdateNLSLayer]
  );
  const handleLayerVisibilityUpdate = useCallback(
    async (inp: LayerVisibilityUpdateProps) => {
      await useUpdateNLSLayer({
        layerId: inp.layerId,
        visible: inp.visible
      });
    },
    [useUpdateNLSLayer]
  );

  useEffect(() => {
    setSelectedLayer((prev) => {
      if (prev?.layer) {
        const layer = nlsLayers.find((l) => l.id === prev.layer?.id);
        return layer
          ? {
              ...prev,
              layer
            }
          : undefined;
      }
      return prev;
    });
  }, [nlsLayers]);

  const handleLayerMove = useCallback(
    async (inp: LayerMoveProps) => {
      if (!originNlsLayers) return;

      const updatedLayerIds = [...sortedLayerIds];
      const currentIndex = updatedLayerIds.indexOf(inp.layerId);
      if (currentIndex !== -1) {
        const [movedItem] = updatedLayerIds.splice(currentIndex, 1);
        updatedLayerIds.splice(inp.index, 0, movedItem);
      }
      setSortedLayerIds(updatedLayerIds);

      const layersInput = {
        layers: updatedLayerIds.map((layerId, i) => ({
          layerId,
          index: i
        }))
      };

      await useUpdateNLSLayers(layersInput);
    },
    [originNlsLayers, sortedLayerIds, useUpdateNLSLayers]
  );

  const handleCustomPropertySchemaClick = useCallback((id?: string) => {
    if (!id) return;
    setLayerId(id);
  }, []);

  const handleCustomPropertySchemaUpdate = useCallback(
    async (inp: UpdateCustomPropertySchemaInput) => {
      await useUpdateCustomProperties({
        layerId: inp.layerId,
        schema: inp.schema
      });
    },
    [useUpdateCustomProperties]
  );

  const handleChangeCustomPropertyTitle = useCallback(
    async (inp: ChangeCustomPropertyTitleInput) => {
      await useChangeCustomPropertyTitle({
        layerId: inp.layerId,
        oldTitle: inp.oldTitle,
        newTitle: inp.newTitle,
        schema: inp.schema
      });
    },
    [useChangeCustomPropertyTitle]
  );

  const handleRemoveCustomProperty = useCallback(
    async (inp: RemoveCustomPropertyInput) => {
      await useRemoveCustomProperty({
        layerId: inp.layerId,
        removedTitle: inp.removedTitle,
        schema: inp.schema
      });
    },
    [useRemoveCustomProperty]
  );
  return {
    nlsLayers,
    selectedLayer,
    selectedFeature,
    ignoreCoreLayerUnselect,
    layerId,
    handleLayerSelect,
    handleCoreLayerSelect,
    handleLayerAdd,
    handleLayerDelete,
    handleLayerNameUpdate,
    handleLayerConfigUpdate,
    handleLayerVisibilityUpdate,
    handleLayerMove,
    handleCustomPropertySchemaClick,
    handleCustomPropertySchemaUpdate,
    handleChangeCustomPropertyTitle,
    handleRemoveCustomProperty
  };
}
