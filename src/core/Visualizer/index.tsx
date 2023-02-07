import { CSSProperties, type ReactNode } from "react";

// TODO(@keiya01): Change directory structure
import DropHolder from "@reearth/components/atoms/DropHolder";
import Filled from "@reearth/components/atoms/Filled";

import Crust, {
  type Alignment,
  type Location,
  type WidgetAlignSystem,
  type WidgetLayoutConstraint,
  type ExternalPluginProps,
  type InternalWidget,
  WidgetAreaType,
} from "../Crust";
import { Tag } from "../mantle";
import Map, {
  type ValueTypes,
  type ValueType,
  type SceneProperty,
  type Layer,
  type LayerSelectionReason,
  type Camera,
  type LatLng,
  type Cluster,
  type ComputedLayer,
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
export type { Viewport } from "./useViewport";

export type Props = {
  engine?: EngineType;
  isBuilt?: boolean;
  isEditable?: boolean;
  inEditor?: boolean;
  rootLayerId?: string;
  widgetAlignSystem?: WidgetAlignSystem;
  widgetLayoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  widgetAlignSystemEditing?: boolean;
  floatingWidgets?: InternalWidget[];
  sceneProperty?: SceneProperty;
  layers?: Layer[];
  clusters?: Cluster[];
  isLayerDraggable?: boolean;
  isLayerDragging?: boolean;
  camera?: Camera;
  meta?: Record<string, unknown>;
  style?: CSSProperties;
  small?: boolean;
  ready?: boolean;
  tags?: Tag[];
  selectedBlockId?: string;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  selectedWidgetArea?: WidgetAreaType;
  hiddenLayers?: string[];
  zoomedLayerId?: string;
  onCameraChange?: (camera: Camera) => void;
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
  onWidgetAreaSelect?: (widgetArea?: WidgetAreaType) => void;
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
  onZoomToLayer?: (layerId: string | undefined) => void;
  renderInfoboxInsertionPopup?: (onSelect: (bi: number) => void, onClose: () => void) => ReactNode;
} & ExternalPluginProps;

export default function Visualizer({
  engine,
  isBuilt,
  rootLayerId,
  isEditable,
  inEditor,
  sceneProperty,
  layers,
  clusters,
  widgetAlignSystem,
  widgetAlignSystemEditing,
  widgetLayoutConstraint,
  floatingWidgets,
  small,
  ready,
  tags,
  selectedBlockId,
  selectedLayerId,
  selectedWidgetArea,
  hiddenLayers,
  isLayerDraggable,
  isLayerDragging,
  camera: initialCamera,
  meta,
  style,
  pluginBaseUrl,
  pluginProperty,
  zoomedLayerId,
  onLayerDrag,
  onLayerDrop,
  onLayerSelect,
  onCameraChange,
  onWidgetLayoutUpdate,
  onWidgetAlignmentUpdate,
  onWidgetAreaSelect,
  onInfoboxMaskClick,
  onBlockSelect,
  onBlockChange,
  onBlockMove,
  onBlockDelete,
  onBlockInsert,
  onZoomToLayer,
  renderInfoboxInsertionPopup,
}: Props): JSX.Element | null {
  const {
    mapRef,
    wrapperRef,
    selectedLayer,
    selectedBlock,
    selectedFeature,
    selectedComputedFeature,
    viewport,
    camera,
    isMobile,
    overriddenSceneProperty,
    isDroppable,
    handleLayerSelect,
    handleBlockSelect,
    handleCameraChange,
    overrideSceneProperty,
    handleLayerEdit,
    onLayerEdit,
  } = useHooks({
    rootLayerId,
    isEditable,
    camera: initialCamera,
    selectedBlockId,
    sceneProperty,
    zoomedLayerId,
    onLayerSelect,
    onBlockSelect,
    onCameraChange,
    onZoomToLayer,
  });

  return (
    <Filled ref={wrapperRef}>
      {isDroppable && <DropHolder />}
      <Crust
        engineName={engine}
        tags={tags}
        viewport={viewport}
        isBuilt={isBuilt}
        isEditable={isEditable}
        inEditor={inEditor}
        sceneProperty={overriddenSceneProperty}
        overrideSceneProperty={overrideSceneProperty}
        blocks={selectedLayer?.layer?.layer.infobox?.blocks}
        camera={camera}
        isMobile={isMobile}
        selectedWidgetArea={selectedWidgetArea}
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
        floatingWidgets={floatingWidgets}
        mapRef={mapRef}
        externalPlugin={{ pluginBaseUrl, pluginProperty }}
        onWidgetLayoutUpdate={onWidgetLayoutUpdate}
        onWidgetAlignmentUpdate={onWidgetAlignmentUpdate}
        onWidgetAreaSelect={onWidgetAreaSelect}
        onInfoboxMaskClick={onInfoboxMaskClick}
        onBlockSelect={handleBlockSelect}
        onBlockChange={onBlockChange}
        onBlockMove={onBlockMove}
        onBlockDelete={onBlockDelete}
        onBlockInsert={onBlockInsert}
        renderInfoboxInsertionPopup={renderInfoboxInsertionPopup}
        onLayerEdit={onLayerEdit}
      />
      <Map
        ref={mapRef}
        isBuilt={isBuilt}
        isEditable={isEditable}
        engine={engine}
        layers={layers}
        engines={engines}
        camera={camera}
        clusters={clusters}
        hiddenLayers={hiddenLayers}
        isLayerDraggable={isLayerDraggable}
        isLayerDragging={isLayerDragging}
        meta={meta}
        style={style}
        // overrides={overrides} // not used for now
        property={overriddenSceneProperty}
        selectedLayerId={selectedLayerId}
        small={small}
        ready={ready}
        onCameraChange={handleCameraChange}
        onLayerDrag={onLayerDrag}
        onLayerDrop={onLayerDrop}
        onLayerSelect={handleLayerSelect}
        onLayerEdit={handleLayerEdit}
      />
    </Filled>
  );
}
