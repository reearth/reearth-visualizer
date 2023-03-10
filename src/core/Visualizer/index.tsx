import { CSSProperties, useMemo, type ReactNode } from "react";

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
  BuiltinWidgets,
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
  ownBuiltinWidgets?: (keyof BuiltinWidgets)[];
  widgetAlignSystemEditing?: boolean;
  floatingWidgets?: InternalWidget[];
  sceneProperty?: SceneProperty;
  layers?: Layer[];
  clusters?: Cluster[];
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
  layerSelectionReason?: LayerSelectionReason;
  selectedWidgetArea?: WidgetAreaType;
  hiddenLayers?: string[];
  zoomedLayerId?: string;
  onCameraChange?: (camera: Camera) => void;
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
  ownBuiltinWidgets,
  small,
  ready,
  tags,
  selectedBlockId,
  selectedLayerId,
  selectedWidgetArea,
  hiddenLayers,
  camera: initialCamera,
  meta,
  style,
  pluginBaseUrl,
  pluginProperty,
  zoomedLayerId,
  layerSelectionReason,
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
    overriddenClock,
    isDroppable,
    isLayerDragging,
    infobox,
    shouldRender,
    handleLayerSelect,
    handleBlockSelect,
    handleCameraChange,
    handleLayerDrag,
    handleLayerDrop,
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
    ownBuiltinWidgets,
    onLayerSelect,
    onBlockSelect,
    onCameraChange,
    onZoomToLayer,
    onLayerDrop,
  });

  const selectedLayerIdForCrust = useMemo(
    () => ({ layerId: selectedLayer.layerId, featureId: selectedLayer.featureId }),
    [selectedLayer.featureId, selectedLayer.layerId],
  );

  return (
    <Filled ref={wrapperRef}>
      {isDroppable && <DropHolder />}
      <Crust
        engineName={engine}
        tags={tags}
        viewport={viewport}
        isBuilt={isBuilt}
        isEditable={isEditable && infobox?.isEditable}
        inEditor={inEditor}
        sceneProperty={overriddenSceneProperty}
        overrideSceneProperty={overrideSceneProperty}
        overriddenClock={overriddenClock}
        blocks={infobox?.blocks}
        camera={camera}
        isMobile={isMobile}
        selectedWidgetArea={selectedWidgetArea}
        selectedComputedLayer={selectedLayer?.layer}
        selectedFeature={selectedFeature}
        selectedComputedFeature={selectedComputedFeature}
        selectedReason={selectedLayer.reason}
        infoboxProperty={infobox?.property}
        infoboxTitle={infobox?.title}
        infoboxVisible={!!infobox?.visible}
        selectedBlockId={selectedBlock}
        selectedLayerId={selectedLayerIdForCrust}
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
        isLayerDragging={isLayerDragging}
        isLayerDraggable={isEditable}
        meta={meta}
        style={style}
        shouldRender={shouldRender}
        // overrides={overrides} // not used for now
        property={overriddenSceneProperty}
        selectedLayerId={selectedLayerId}
        layerSelectionReason={layerSelectionReason}
        small={small}
        ready={ready}
        onCameraChange={handleCameraChange}
        onLayerDrag={handleLayerDrag}
        onLayerDrop={handleLayerDrop}
        onLayerSelect={handleLayerSelect}
        onLayerEdit={handleLayerEdit}
      />
    </Filled>
  );
}
