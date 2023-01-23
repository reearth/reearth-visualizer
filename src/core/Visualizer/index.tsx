import { CSSProperties, type ReactNode } from "react";

import Crust, {
  type Alignment,
  type Location,
  type WidgetAlignSystem,
  type WidgetLayoutConstraint,
} from "../Crust";
import Map, {
  type ValueTypes,
  type ValueType,
  type SceneProperty,
  type Layer,
  type LayerSelectionReason,
  type Camera,
  type LatLng,
  type Cluster,
  ComputedLayer,
} from "../Map";

import { engines, type EngineType } from "./engines";
import useHooks from "./hooks";

export type {
  Alignment,
  Location,
  ValueTypes,
  ValueType,
  WidgetAlignSystem,
  WidgetLayoutConstraint,
} from "../Crust";
export type { EngineType } from "./engines";

export type Props = {
  engine?: EngineType;
  isBuilt?: boolean;
  isEditable?: boolean;
  widgetAlignSystem?: WidgetAlignSystem;
  widgetLayoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  widgetAlignSystemEditing?: boolean;
  sceneProperty?: SceneProperty;
  layers?: Layer[];
  clusters?: Cluster[];
  isLayerDraggable?: boolean;
  isLayerDragging?: boolean;
  camera?: Camera;
  clock?: Date;
  meta?: Record<string, unknown>;
  style?: CSSProperties;
  small?: boolean;
  ready?: boolean;
  selectedBlockId?: string;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  hiddenLayers?: string[];
  onCameraChange?: (camera: Camera) => void;
  onTick?: (clock: Date) => void;
  onLayerDrag?: (layerId: string, position: LatLng) => void;
  onLayerDrop?: (layerId: string, propertyKey: string, position: LatLng | undefined) => void;
  onLayerSelect?: (
    layerId: string | undefined,
    featureId: string | undefined,
    layer: (() => Promise<ComputedLayer | undefined>) | undefined,
    reason: LayerSelectionReason | undefined,
  ) => void;
  onWidgetLayoutUpdate?: (
    id: string,
    update: {
      location?: Location;
      extended?: boolean;
      index?: number;
    },
  ) => void;
  onWidgetAlignmentUpdate?: (location: Location, align: Alignment) => void;
  onInfoboxMaskClick?: () => void;
  onBlockSelect?: (id?: string) => void;
  onBlockChange?: <T extends ValueType>(
    blockId: string,
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
  onBlockMove?: (id: string, fromIndex: number, toIndex: number) => void;
  onBlockDelete?: (id: string) => void;
  onBlockInsert?: (bi: number, i: number, pos?: "top" | "bottom") => void;
  renderInfoboxInsertionPopup?: (onSelect: (bi: number) => void, onClose: () => void) => ReactNode;
};

export default function Visualizer({
  engine,
  isBuilt,
  isEditable,
  sceneProperty,
  layers,
  clusters,
  widgetAlignSystem,
  widgetAlignSystemEditing,
  widgetLayoutConstraint,
  small,
  ready,
  selectedBlockId,
  selectedLayerId,
  hiddenLayers,
  isLayerDraggable,
  isLayerDragging,
  camera: initialCamera,
  clock: initialClock,
  meta,
  style,
  onLayerDrag,
  onLayerDrop,
  onLayerSelect,
  onCameraChange,
  onWidgetLayoutUpdate,
  onWidgetAlignmentUpdate,
  onInfoboxMaskClick,
  onTick,
  onBlockSelect,
  onBlockChange,
  onBlockMove,
  onBlockDelete,
  onBlockInsert,
  renderInfoboxInsertionPopup,
}: Props): JSX.Element | null {
  const {
    mapRef,
    selectedLayer,
    selectedBlock,
    selectedFeature,
    selectedComputedFeature,
    camera,
    clock,
    isMobile,
    handleLayerSelect,
    handleBlockSelect,
    handleCameraChange,
    handleTick,
  } = useHooks({
    camera: initialCamera,
    clock: initialClock,
    selectedBlockId,
    onLayerSelect,
    onBlockSelect,
    onCameraChange,
    onTick,
  });

  return (
    <>
      <Crust
        isBuilt={isBuilt}
        isEditable={isEditable}
        sceneProperty={sceneProperty}
        blocks={selectedLayer?.layer?.layer.infobox?.blocks}
        camera={camera}
        clock={clock}
        isMobile={isMobile}
        selectedComputedLayer={selectedLayer?.layer}
        selectedFeature={selectedFeature}
        selectedComputedFeature={selectedComputedFeature}
        selectedReason={selectedLayer.reason}
        infoboxProperty={selectedLayer?.layer?.layer.infobox?.property?.default}
        infoboxTitle={selectedLayer?.layer?.layer.title}
        infoboxVisible={!!selectedLayer?.layer?.layer.infobox}
        selectedBlockId={selectedBlock}
        selectedLayerId={{ layerId: selectedLayer.layerId, featureId: selectedLayer.featureId }}
        widgetAlignSystem={widgetAlignSystem}
        widgetAlignSystemEditing={widgetAlignSystemEditing}
        widgetLayoutConstraint={widgetLayoutConstraint}
        mapRef={mapRef}
        onWidgetLayoutUpdate={onWidgetLayoutUpdate}
        onWidgetAlignmentUpdate={onWidgetAlignmentUpdate}
        onInfoboxMaskClick={onInfoboxMaskClick}
        onBlockSelect={handleBlockSelect}
        onBlockChange={onBlockChange}
        onBlockMove={onBlockMove}
        onBlockDelete={onBlockDelete}
        onBlockInsert={onBlockInsert}
        renderInfoboxInsertionPopup={renderInfoboxInsertionPopup}
      />
      <Map
        ref={mapRef}
        isBuilt={isBuilt}
        isEditable={isEditable}
        sceneProperty={sceneProperty}
        engine={engine}
        layers={layers}
        engines={engines}
        camera={camera}
        clock={clock}
        clusters={clusters}
        hiddenLayers={hiddenLayers}
        isLayerDraggable={isLayerDraggable}
        isLayerDragging={isLayerDragging}
        meta={meta}
        style={style}
        // overrides={overrides} // not used for now
        property={sceneProperty}
        selectedLayerId={selectedLayerId}
        small={small}
        ready={ready}
        onCameraChange={handleCameraChange}
        onLayerDrag={onLayerDrag}
        onLayerDrop={onLayerDrop}
        onLayerSelect={handleLayerSelect}
        onTick={handleTick}
      />
    </>
  );
}
