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
export { Viewport } from "./useViewport";

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
  clock?: Date;
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
  hiddenLayers,
  isLayerDraggable,
  isLayerDragging,
  camera: initialCamera,
  clock: initialClock,
  meta,
  style,
  pluginBaseUrl,
  pluginProperty,
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
    wrapperRef,
    selectedLayer,
    selectedBlock,
    selectedFeature,
    selectedComputedFeature,
    viewport,
    camera,
    clock,
    isMobile,
    overriddenSceneProperty,
    isDroppable,
    handleLayerSelect,
    handleBlockSelect,
    handleCameraChange,
    handleTick,
    overrideSceneProperty,
  } = useHooks({
    rootLayerId,
    isEditable,
    camera: initialCamera,
    clock: initialClock,
    selectedBlockId,
    sceneProperty,
    onLayerSelect,
    onBlockSelect,
    onCameraChange,
    onTick,
  });

  return (
    <Filled ref={wrapperRef}>
      {isDroppable && <DropHolder />}
      <Map
        ref={mapRef}
        isBuilt={isBuilt}
        isEditable={isEditable}
        sceneProperty={overriddenSceneProperty}
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
        floatingWidgets={floatingWidgets}
        mapRef={mapRef}
        externalPlugin={{ pluginBaseUrl, pluginProperty }}
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
    </Filled>
  );
}
