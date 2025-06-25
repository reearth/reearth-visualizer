import { MapRef } from "@reearth/app/features/Visualizer/Crust/types";
import {
  SketchFeature,
  SketchType,
  Geometry,
  SketchEditingFeature
} from "@reearth/core";
import { useFeatureCollectionFetcher } from "@reearth/services/api";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { Tab } from "../../Navbar";

import { SelectedFeature, SelectedLayer } from "./useLayers";

type Props = {
  tab: Tab;
  nlsLayers: NLSLayer[];
  selectedLayer: SelectedLayer | undefined;
  selectedFeature: SelectedFeature | undefined;
  visualizerRef: MutableRefObject<MapRef | null>;
  ignoreCoreLayerUnselect: MutableRefObject<boolean>;
};

export type FeatureProps = {
  layerId: string;
  type: string;
  geometry?: Geometry;
  properties?: any;
};

export type GeoJsonFeatureUpdateProps = {
  featureId: string;
  geometry: Geometry | undefined;
  layerId: string;
  properties?: any;
};

export type GeoJsonFeatureDeleteProps = {
  layerId: string;
  featureId: string;
};

export default ({
  tab,
  nlsLayers,
  selectedLayer,
  selectedFeature,
  visualizerRef,
  ignoreCoreLayerUnselect
}: Props) => {
  const [sketchType, setSketchType] = useState<SketchType | undefined>(
    undefined
  );

  const selectedSketchFeature = useMemo(() => {
    if (!selectedLayer?.layer?.sketch) return;

    const { sketch } = selectedLayer.layer;
    const features = sketch?.featureCollection?.features;

    if (!selectedFeature?.properties?.id) return;

    const selectedFeatureId = selectedFeature.properties.id;

    return features?.find(
      (feature) => feature.properties.id === selectedFeatureId
    );
  }, [selectedLayer, selectedFeature]);

  const pendingSketchSelectionRef = useRef<
    { layerId: string; featureId: string } | undefined
  >(undefined);

  const handleSketchTypeChange = useCallback(
    (type: SketchType | undefined, from: "editor" | "plugin" = "editor") => {
      setSketchType(type);
      if (from === "editor") visualizerRef.current?.sketch?.setType?.(type);
      visualizerRef.current?.sketch?.overrideOptions?.({
        autoResetInteractionMode: false
      });
    },
    [visualizerRef]
  );

  const {
    useAddGeoJsonFeature,
    useUpdateGeoJSONFeature,
    useDeleteGeoJSONFeature
  } = useFeatureCollectionFetcher();

  const handleSketchLayerAdd = useCallback(
    async (inp: FeatureProps) => {
      if (!selectedLayer?.layer?.id) return;
      await useAddGeoJsonFeature({
        layerId: inp.layerId,
        geometry: inp.geometry,
        type: inp.type,
        properties: inp.properties
      });
    },
    [selectedLayer, useAddGeoJsonFeature]
  );

  const handleSketchFeatureCreate = useCallback(
    async (feature: SketchFeature | null) => {
      // TODO: create a new layer if there is no selected sketch layer
      if (
        !feature ||
        !selectedLayer?.layer?.id ||
        !selectedLayer?.layer?.isSketch
      )
        return;

      await handleSketchLayerAdd({
        type: feature.type,
        layerId: selectedLayer?.layer?.id,
        properties: { ...feature.properties },
        geometry: feature.geometry
      });

      pendingSketchSelectionRef.current = {
        layerId: selectedLayer.layer?.id,
        featureId: feature.properties.id
      };

      ignoreCoreLayerUnselect.current = true;
    },
    [selectedLayer?.layer, ignoreCoreLayerUnselect, handleSketchLayerAdd]
  );

  useEffect(() => {
    // Workaround: in order to show the indicator of the selected sketch feature we need to unselect it first.
    if (pendingSketchSelectionRef.current) {
      visualizerRef?.current?.layers.select(undefined);
    }
    // Workaround: we can't get an notice from core after nlsLayers got updated.
    // Therefore we need to get and select the latest sketch feature manually delayed.
    setTimeout(() => {
      if (pendingSketchSelectionRef.current) {
        const { layerId, featureId } = pendingSketchSelectionRef.current;
        visualizerRef?.current?.layers.selectFeature(layerId, featureId);
        pendingSketchSelectionRef.current = undefined;
        ignoreCoreLayerUnselect.current = false;
      }
    }, 100);
  }, [
    nlsLayers,
    pendingSketchSelectionRef,
    visualizerRef,
    ignoreCoreLayerUnselect
  ]);

  useEffect(() => {
    handleSketchTypeChange(undefined, "editor");
  }, [tab, handleSketchTypeChange]);

  const handleGeoJsonFeatureUpdate = useCallback(
    async (inp: GeoJsonFeatureUpdateProps) => {
      await useUpdateGeoJSONFeature({
        layerId: inp.layerId,
        featureId: inp.featureId,
        geometry: inp.geometry,
        properties: inp.properties
      });

      pendingSketchSelectionRef.current = {
        layerId: inp.layerId,
        featureId: inp.properties?.id
      };
    },
    [useUpdateGeoJSONFeature]
  );

  const handleGeoJsonFeatureDelete = useCallback(
    async (inp: GeoJsonFeatureDeleteProps) => {
      await useDeleteGeoJSONFeature({
        layerId: inp.layerId,
        featureId: inp.featureId
      });
    },
    [useDeleteGeoJSONFeature]
  );

  const handleSketchFeatureUpdate = useCallback(
    async (feature: SketchFeature | null) => {
      if (
        !selectedLayer?.layer?.id ||
        !selectedLayer?.computedFeature?.id ||
        selectedLayer.computedFeature.id !== feature?.properties?.id ||
        !feature
      )
        return;

      const featureDataId =
        selectedLayer.layer?.sketch?.featureCollection?.features?.find(
          (f) => f.properties.id === feature.properties.id
        )?.id;

      if (!featureDataId) return;

      await handleGeoJsonFeatureUpdate({
        layerId: selectedLayer.layer.id,
        featureId: featureDataId,
        geometry: feature.geometry,
        properties: {
          ...selectedLayer.computedFeature.properties,
          ...feature.properties
        }
      });

      pendingSketchSelectionRef.current = {
        layerId: selectedLayer.layer.id,
        featureId: feature.properties.id
      };
    },
    [selectedLayer, handleGeoJsonFeatureUpdate]
  );

  const [sketchEditingFeature, setSketchEditingFeature] = useState<
    SketchEditingFeature | undefined
  >();

  const handleEditSketchFeature = useCallback(() => {
    if (
      !selectedLayer?.layer?.id ||
      !selectedLayer?.computedFeature?.id ||
      !selectedLayer?.layer?.isSketch
    )
      return;
    visualizerRef.current?.sketch.editFeature({
      layerId: selectedLayer.layer.id,
      feature: selectedLayer.computedFeature
    });
  }, [visualizerRef, selectedLayer]);

  const handleCancelEditSketchFeature = useCallback(
    (ignoreAutoReSelect?: boolean) => {
      visualizerRef.current?.sketch.cancelEdit(ignoreAutoReSelect);
    },
    [visualizerRef]
  );

  const handleApplyEditSketchFeature = useCallback(() => {
    visualizerRef.current?.sketch.applyEdit();
  }, [visualizerRef]);

  const initSketch = useCallback(() => {
    visualizerRef.current?.sketch.overrideOptions({
      dataOnly: true
    });
    visualizerRef.current?.sketch.onEditFeatureChange(setSketchEditingFeature);
  }, [visualizerRef]);

  return {
    sketchType,
    sketchEditingFeature,
    selectedSketchFeature,
    handleSketchTypeChange,
    handleSketchFeatureCreate,
    handleSketchFeatureUpdate,
    handleGeoJsonFeatureUpdate,
    handleGeoJsonFeatureDelete,
    handleSketchGeometryEditStart: handleEditSketchFeature,
    handleSketchGeometryEditCancel: handleCancelEditSketchFeature,
    handleSketchGeometryEditApply: handleApplyEditSketchFeature,
    initSketch
  };
};
