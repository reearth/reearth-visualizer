import { type RefObject } from "react";

import type { SelectedFeatureInfo, Tag } from "@reearth/beta/lib/core/mantle";

import type { ComputedFeature, ComputedLayer, Feature } from "../mantle";
import type { LayerEditEvent, LayerSelectionReason } from "../Map";
import { SketchEventCallback, SketchType } from "../Map/Sketch/types";
import type { TimelineManagerRef } from "../Map/useTimelineManager";
import type { Viewport } from "../Visualizer";

import { useWidgetContext } from "./context";
import useHooks from "./hooks";
import Infobox from "./Infobox";
import { Infobox as InfoboxType } from "./Infobox/types";
import Plugins, { type ExternalPluginProps, ModalContainer, PopupContainer } from "./Plugins";
import { usePublishTheme } from "./theme";
import type { MapRef, SceneProperty, Camera, InteractionModeType } from "./types";
import Widgets, {
  type WidgetAlignSystem as WidgetAlignSystemType,
  type Alignment,
  type Location,
  type WidgetLayoutConstraint,
  type InternalWidget,
  type WidgetAreaType,
} from "./Widgets";

export type { ValueTypes, ValueType, InteractionModeType } from "./types";

export type { Block } from "./Infobox/OldInfobox";

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
  selectedWidgetArea?: WidgetAreaType;
  // infobox
  infobox?: InfoboxType;
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
  onBlockCreate?: (
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void>;
  onBlockMove?: (id: string, targetIndex: number) => void;
  onBlockDelete?: (blockId?: string) => Promise<void>;
  overrideSceneProperty: (pluginId: string, property: SceneProperty) => void;
  onLayerEdit: (cb: (e: LayerEditEvent) => void) => void;
  onPluginSketchFeatureCreated: (cb: SketchEventCallback) => void;
  onSketchTypeChange: (cb: (type: SketchType | undefined) => void) => void;
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
  infobox,
  selectedWidgetArea,
  externalPlugin,
  useExperimentalSandbox,
  timelineManagerRef,
  overrideInteractionMode,
  onWidgetLayoutUpdate,
  onWidgetAlignmentUpdate,
  onWidgetAreaSelect,
  onBlockCreate,
  onBlockMove,
  onBlockDelete,
  overrideSceneProperty,
  onLayerEdit,
  onPluginSketchFeatureCreated,
  onSketchTypeChange,
}: Props): JSX.Element | null {
  const {
    shownPluginModalInfo,
    shownPluginPopupInfo,
    pluginModalContainerRef,
    pluginPopupContainerRef,
    renderWidget,
    renderBlock,
    onPluginModalShow,
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
      timelineManagerRef={timelineManagerRef}
      useExperimentalSandbox={useExperimentalSandbox}
      overrideInteractionMode={overrideInteractionMode}
      overrideSceneProperty={overrideSceneProperty}
      onSketchTypeChange={onSketchTypeChange}
      onPluginSketchFeatureCreated={onPluginSketchFeatureCreated}
      onLayerEdit={onLayerEdit}>
      <ModalContainer
        ref={pluginModalContainerRef}
        shownPluginModalInfo={shownPluginModalInfo}
        onPluginModalShow={onPluginModalShow}
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
      {infobox && (
        <Infobox
          infobox={infobox}
          isEditable={isEditable}
          renderBlock={renderBlock}
          onBlockCreate={onBlockCreate}
          onBlockDelete={onBlockDelete}
          onBlockMove={onBlockMove}
          onPropertyItemAdd={async () => console.log("ADD")}
          onPropertyItemDelete={async () => console.log("DELETE")}
          onPropertyItemMove={async () => console.log("MOVE")}
          onPropertyUpdate={async () => console.log("UPDATE")}
        />
      )}
    </Plugins>
  );
}
