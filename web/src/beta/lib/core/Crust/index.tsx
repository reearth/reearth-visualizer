import { type ReactNode, type RefObject } from "react";

import type { SelectedFeatureInfo, Tag } from "@reearth/beta/lib/core/mantle";

import type { ComputedFeature, ComputedLayer, Feature } from "../mantle";
import type {
  LayerEditEvent,
  LayerLoadEvent,
  LayerSelectionReason,
  LayerSelectWithRectEnd,
  LayerSelectWithRectMove,
  LayerSelectWithRectStart,
  LayerVisibilityEvent,
} from "../Map";
import { SketchEventCallback, SketchType } from "../Map/Sketch/types";
import type { TimelineManagerRef } from "../Map/useTimelineManager";
import type { Viewport } from "../Visualizer";

import { useWidgetContext } from "./context";
import useHooks from "./hooks";
import Infobox, { Block, InfoboxProperty } from "./Infobox";
import Plugins, { type ExternalPluginProps, ModalContainer, PopupContainer } from "./Plugins";
import { usePublishTheme } from "./theme";
import type {
  ValueTypes,
  ValueType,
  MapRef,
  SceneProperty,
  Camera,
  InteractionModeType,
} from "./types";
import Widgets, {
  type WidgetAlignSystem as WidgetAlignSystemType,
  type Alignment,
  type Location,
  type WidgetLayoutConstraint,
  type InternalWidget,
  type WidgetAreaType,
} from "./Widgets";

export type { ValueTypes, ValueType, InteractionModeType } from "./types";

export type { Block } from "./Infobox";

export type { ExternalPluginProps } from "./Plugins";
export { INTERACTION_MODES } from "./interactionMode";
export { FEATURE_FLAGS } from "./featureFlags";

export type {
  Context,
  WidgetLayoutConstraint,
  WidgetAlignSystem,
  Alignment,
  Location,
  InternalWidget,
  WidgetZone,
  WidgetSection,
  BuiltinWidgets,
  WidgetArea,
  WidgetAlignment,
  WidgetAreaType,
} from "./Widgets";
export { isBuiltinWidget } from "./Widgets";

export type Props = {
  // common
  engineName?: string;
  isEditable?: boolean;
  inEditor?: boolean;
  isBuilt?: boolean;
  isMobile?: boolean;
  mapRef?: RefObject<MapRef>;
  sceneProperty?: SceneProperty;
  viewport?: Viewport;
  camera?: Camera;
  interactionMode: InteractionModeType;
  overrideInteractionMode: (mode: InteractionModeType) => void;
  selectedComputedLayer?: ComputedLayer;
  selectedComputedFeature?: ComputedFeature;
  selectedFeature?: Feature;
  selectedReason?: LayerSelectionReason;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  selectedFeatureInfo?: SelectedFeatureInfo;
  tags?: Tag[];
  // widgets
  widgetAlignSystem?: WidgetAlignSystemType;
  widgetAlignSystemEditing?: boolean;
  widgetLayoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  floatingWidgets?: InternalWidget[];
  // infobox
  infoboxProperty?: InfoboxProperty;
  blocks?: Block[];
  infoboxTitle?: string;
  selectedBlockId?: string;
  showInfoboxTitle?: boolean;
  selectedWidgetArea?: WidgetAreaType;
  infoboxVisible?: boolean;
  // plugin
  externalPlugin: ExternalPluginProps;
  useExperimentalSandbox?: boolean;
  // timeline manager
  timelineManagerRef?: TimelineManagerRef;
  // widget events
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
  // infobox events
  onInfoboxMaskClick?: () => void;
  onInfoboxClose?: () => void;
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
  overrideSceneProperty: (pluginId: string, property: SceneProperty) => void;
  onLayerEdit: (cb: (e: LayerEditEvent) => void) => void;
  onLayerSelectWithRectStart: (cb: (e: LayerSelectWithRectStart) => void) => void;
  onLayerSelectWithRectMove: (cb: (e: LayerSelectWithRectMove) => void) => void;
  onLayerSelectWithRectEnd: (cb: (e: LayerSelectWithRectEnd) => void) => void;
  onPluginSketchFeatureCreated: (cb: SketchEventCallback) => void;
  onSketchTypeChange: (cb: (type: SketchType | undefined) => void) => void;
  onLayerVisibility: (cb: (e: LayerVisibilityEvent) => void) => void;
  onLayerLoad: (cb: (e: LayerLoadEvent) => void) => void;
  onCameraForceHorizontalRollChange: (enable?: boolean) => void;
};

export default function Crust({
  engineName,
  isBuilt,
  isEditable,
  inEditor,
  isMobile,
  mapRef,
  sceneProperty,
  viewport,
  camera,
  interactionMode,
  tags,
  selectedLayerId,
  selectedReason,
  selectedComputedLayer,
  selectedComputedFeature,
  selectedFeatureInfo,
  widgetAlignSystem,
  widgetAlignSystemEditing,
  widgetLayoutConstraint,
  floatingWidgets,
  blocks,
  infoboxProperty,
  infoboxTitle,
  infoboxVisible,
  selectedBlockId,
  selectedWidgetArea,
  externalPlugin,
  useExperimentalSandbox,
  timelineManagerRef,
  overrideInteractionMode,
  onWidgetLayoutUpdate,
  onWidgetAlignmentUpdate,
  onWidgetAreaSelect,
  onInfoboxMaskClick,
  onInfoboxClose,
  onBlockSelect,
  onBlockChange,
  onBlockMove,
  onBlockDelete,
  onBlockInsert,
  renderInfoboxInsertionPopup,
  overrideSceneProperty,
  onLayerEdit,
  onLayerSelectWithRectStart,
  onLayerSelectWithRectMove,
  onLayerSelectWithRectEnd,
  onPluginSketchFeatureCreated,
  onSketchTypeChange,
  onLayerVisibility,
  onLayerLoad,
  onCameraForceHorizontalRollChange,
}: Props): JSX.Element | null {
  const {
    renderBlock,
    renderWidget,
    shownPluginModalInfo,
    shownPluginPopupInfo,
    onPluginModalShow,
    pluginModalContainerRef,
    pluginPopupContainerRef,
  } = useHooks({ mapRef, ...externalPlugin });
  const theme = usePublishTheme(sceneProperty?.theme);
  const widgetContext = useWidgetContext({
    mapRef,
    camera,
    sceneProperty,
    selectedLayerId,
    timelineManagerRef,
  });

  return (
    <Plugins
      engineName={engineName}
      mapRef={mapRef}
      sceneProperty={sceneProperty}
      built={isBuilt}
      inEditor={inEditor}
      tags={tags}
      selectedLayer={selectedComputedLayer}
      selectedFeature={selectedComputedFeature}
      selectedFeatureInfo={selectedFeatureInfo}
      layerSelectionReason={selectedReason}
      viewport={viewport}
      alignSystem={widgetAlignSystem}
      floatingWidgets={floatingWidgets}
      camera={camera}
      interactionMode={interactionMode}
      overrideInteractionMode={overrideInteractionMode}
      useExperimentalSandbox={useExperimentalSandbox}
      overrideSceneProperty={overrideSceneProperty}
      timelineManagerRef={timelineManagerRef}
      onLayerEdit={onLayerEdit}
      onLayerSelectWithRectStart={onLayerSelectWithRectStart}
      onLayerSelectWithRectMove={onLayerSelectWithRectMove}
      onLayerSelectWithRectEnd={onLayerSelectWithRectEnd}
      onPluginSketchFeatureCreated={onPluginSketchFeatureCreated}
      onSketchTypeChange={onSketchTypeChange}
      onLayerVisibility={onLayerVisibility}
      onLayerLoad={onLayerLoad}
      onCameraForceHorizontalRollChange={onCameraForceHorizontalRollChange}>
      <ModalContainer
        shownPluginModalInfo={shownPluginModalInfo}
        onPluginModalShow={onPluginModalShow}
        ref={pluginModalContainerRef}
      />
      <PopupContainer shownPluginPopupInfo={shownPluginPopupInfo} ref={pluginPopupContainerRef} />
      <Widgets
        isMobile={isMobile}
        isBuilt={isBuilt}
        isEditable={isEditable}
        inEditor={inEditor}
        alignSystem={widgetAlignSystem}
        floatingWidgets={floatingWidgets}
        selectedWidgetArea={selectedWidgetArea}
        editing={widgetAlignSystemEditing}
        layoutConstraint={widgetLayoutConstraint}
        theme={theme}
        context={widgetContext}
        onWidgetLayoutUpdate={onWidgetLayoutUpdate}
        onAlignmentUpdate={onWidgetAlignmentUpdate}
        onWidgetAreaSelect={onWidgetAreaSelect}
        renderWidget={renderWidget}
      />
      <Infobox
        isBuilt={isBuilt}
        isEditable={isEditable}
        blocks={blocks}
        infoboxKey={selectedLayerId?.layerId}
        property={infoboxProperty}
        title={infoboxTitle}
        visible={infoboxVisible}
        selectedBlockId={selectedBlockId}
        theme={theme}
        layer={selectedComputedLayer?.layer}
        onMaskClick={onInfoboxMaskClick}
        onBlockSelect={onBlockSelect}
        onBlockChange={onBlockChange}
        onBlockDelete={onBlockDelete}
        onBlockMove={onBlockMove}
        onBlockInsert={onBlockInsert}
        renderBlock={renderBlock}
        renderInsertionPopup={renderInfoboxInsertionPopup}
        onClose={onInfoboxClose}
      />
    </Plugins>
  );
}
