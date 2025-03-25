import { ViewerProperty } from "@reearth/beta/features/Editor/Visualizer/type";
import {
  PhotoOverlayPreview,
  SketchFeatureTooltip
} from "@reearth/beta/utils/sketch";
import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import {
  coreContext,
  type Layer,
  type SelectedFeatureInfo,
  type Camera,
  type MapRef
} from "@reearth/core";
import { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useMemo, type RefObject, useContext } from "react";

import { useWidgetContext } from "./context";
import useHooks from "./hooks";
import Infobox, { InstallableInfoboxBlock } from "./Infobox";
import { Infobox as InfoboxType } from "./Infobox/types";
import PhotoOverlay from "./PhotoOverlay";
import Plugins, {
  type ExternalPluginProps,
  ModalContainer,
  PopupContainer
} from "./Plugins";
import SketchTooltip from "./SketchTooltip";
import StoryPanel, { InstallableStoryBlock, StoryPanelRef } from "./StoryPanel";
import { Story } from "./StoryPanel/types";
import { WidgetThemeOptions, usePublishTheme } from "./theme";
import Widgets, {
  type WidgetAlignSystem as WidgetAlignSystemType,
  type Alignment,
  type Location,
  type WidgetLayoutConstraint,
  type InternalWidget,
  type WidgetAreaType
} from "./Widgets";

export type { ValueTypes, ValueType, InteractionModeType } from "./types";

export type { InfoboxBlock as Block } from "./Infobox/types";

export type { ExternalPluginProps } from "./Plugins";

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
  WidgetAreaType
} from "./Widgets";
export { isBuiltinWidget } from "./Widgets";

export type Props = {
  // common
  engineName?: string;
  isEditable?: boolean;
  inEditor?: boolean;
  isBuilt?: boolean;
  mapRef?: RefObject<MapRef>;
  mapAPIReady?: boolean;
  layers?: Layer[];
  camera?: Camera;
  selectedFeatureInfo?: SelectedFeatureInfo;
  // viewer
  viewerProperty?: ViewerProperty;
  overrideViewerProperty?: (pluginId: string, property: ViewerProperty) => void;
  // widgets
  initialCamera?: Camera;
  widgetThemeOptions?: WidgetThemeOptions;
  widgetAlignSystem?: WidgetAlignSystemType;
  widgetAlignSystemEditing?: boolean;
  widgetLayoutConstraint?: Record<string, WidgetLayoutConstraint>;
  floatingWidgets?: InternalWidget[];
  selectedWidgetArea?: WidgetAreaType;
  // infobox
  infobox?: InfoboxType;
  installableInfoboxBlocks?: InstallableInfoboxBlock[];
  // plugin
  externalPlugin: ExternalPluginProps;
  // widget events
  onWidgetLayoutUpdate?: (
    id: string,
    update: {
      location?: Location;
      extended?: boolean;
      index?: number;
    }
  ) => void;
  onWidgetAlignmentUpdate?: (location: Location, align: Alignment) => void;
  onWidgetAreaSelect?: (widgetArea?: WidgetAreaType) => void;
  // infobox events
  onInfoboxBlockCreate?: (
    pluginId: string,
    extensionId: string,
    index?: number | undefined
  ) => Promise<void>;
  onInfoboxBlockMove?: (
    id: string,
    targetIndex: number,
    layerId?: string
  ) => Promise<void>;
  onInfoboxBlockDelete?: (id?: string) => Promise<void>;
  // Infobox
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
  // Story
  showStoryPanel?: boolean;
  storyPanelRef?: RefObject<StoryPanelRef>;
  storyWrapperRef?: RefObject<HTMLDivElement>;
  selectedStory?: Story;
  installableStoryBlocks?: InstallableStoryBlock[];
  onStoryPageChange?: (id?: string, disableScrollIntoView?: boolean) => void;
  onStoryBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined
  ) => Promise<void>;
  onStoryBlockMove?: (id: string, targetId: number, blockId: string) => void;
  onStoryBlockDelete?: (
    pageId?: string | undefined,
    blockId?: string | undefined
  ) => Promise<void>;
  onPropertyValueUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
  // photoOverlay
  photoOverlayPreview?: PhotoOverlayPreview;
  nlsLayers?: NLSLayer[];
  currentCameraRef?: RefObject<Camera | undefined>;
  //sketchLayer
  sketchFeatureTooltip?: SketchFeatureTooltip;
};

export default function Crust({
  engineName,
  isBuilt,
  isEditable,
  inEditor,
  mapRef,
  mapAPIReady,
  selectedFeatureInfo,
  externalPlugin,
  layers,
  // Viewer
  viewerProperty,
  overrideViewerProperty,
  // Widget
  initialCamera,
  widgetThemeOptions,
  widgetAlignSystem,
  widgetAlignSystemEditing,
  widgetLayoutConstraint,
  floatingWidgets,
  selectedWidgetArea,
  onWidgetLayoutUpdate,
  onWidgetAlignmentUpdate,
  onWidgetAreaSelect,
  // Infobox
  installableInfoboxBlocks,
  onInfoboxBlockCreate,
  onInfoboxBlockMove,
  onInfoboxBlockDelete,
  // common
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemMove,
  onPropertyItemDelete,
  // story
  showStoryPanel,
  storyPanelRef,
  storyWrapperRef,
  selectedStory,
  installableStoryBlocks,
  onStoryPageChange,
  onStoryBlockCreate,
  onStoryBlockMove,
  onStoryBlockDelete,
  onPropertyValueUpdate,
  // photoOverlay
  photoOverlayPreview,
  nlsLayers,
  currentCameraRef,
  //sketchLayer
  sketchFeatureTooltip
}: Props): JSX.Element | null {
  const {
    interactionMode,
    selectedLayer,
    selectedComputedFeature,
    viewport,
    handleCameraForceHorizontalRollChange,
    onLayerEdit,
    handleInteractionModeChange,
    onSketchPluginFeatureCreate,
    onSketchPluginFeatureUpdate,
    onSketchTypeChange,
    onLayerVisibility,
    onLayerLoad,
    onLayerSelectWithRectStart,
    onLayerSelectWithRectMove,
    onLayerSelectWithRectEnd
  } = useContext(coreContext);

  const widgetTheme = usePublishTheme(widgetThemeOptions);

  const selectedLayerId = useMemo(
    () => ({
      layerId: selectedLayer?.layerId,
      featureId: selectedLayer?.featureId
    }),
    [selectedLayer?.featureId, selectedLayer?.layerId]
  );

  const {
    shownPluginModalInfo,
    shownPluginPopupInfo,
    pluginModalContainerRef,
    pluginPopupContainerRef,
    renderWidget,
    renderBlock,
    onPluginModalShow
  } = useHooks({ mapRef, ...externalPlugin });

  const widgetContext = useWidgetContext({
    mapRef,
    initialCamera,
    selectedLayerId,
    timelineManagerRef: mapRef?.current?.timeline
  });

  const featuredInfobox = useMemo(() => {
    if (!selectedLayerId?.featureId) return undefined;
    const selectedDataLayer = layers?.find(
      (l) => l.id === selectedLayer?.layerId
    );
    const selectedFeature =
      (selectedDataLayer?.type === "simple" &&
      selectedDataLayer?.data?.isSketchLayer
        ? selectedLayer?.layer?.features?.find(
            (f) => f.id === selectedLayerId.featureId
          )
        : selectedComputedFeature) ?? selectedComputedFeature;

    if (selectedDataLayer?.infobox) {
      return {
        property: selectedDataLayer?.infobox?.property,
        blocks: [...(selectedDataLayer?.infobox?.blocks ?? [])],
        featureId: selectedLayerId.featureId,
        feature: selectedFeature
      };
    }
    const selected = mapRef?.current?.layers?.find(
      (l) => l.id === selectedLayer?.layerId
    );
    if (selected?.infobox) {
      return {
        property: selected?.infobox?.property,
        blocks: [...(selected?.infobox?.blocks ?? [])],
        featureId: selectedLayerId.featureId,
        readOnly: true,
        feature: selectedFeature
      };
    }
    return undefined;
  }, [
    selectedLayerId.featureId,
    layers,
    mapRef,
    selectedLayer,
    selectedComputedFeature
  ]);

  return (
    <Plugins
      engineName={engineName}
      mapRef={mapRef}
      mapAPIReady={mapAPIReady}
      viewerProperty={viewerProperty}
      built={isBuilt}
      inEditor={inEditor}
      selectedLayer={selectedLayer?.layer}
      selectedFeature={selectedComputedFeature}
      selectedFeatureInfo={selectedFeatureInfo}
      selectedStory={selectedStory}
      layerSelectionReason={selectedLayer?.reason}
      viewport={viewport}
      alignSystem={widgetAlignSystem}
      floatingWidgets={floatingWidgets}
      interactionMode={interactionMode ?? "default"}
      timelineManagerRef={mapRef?.current?.timeline}
      overrideInteractionMode={handleInteractionModeChange}
      overrideViewerProperty={overrideViewerProperty}
      onLayerEdit={onLayerEdit}
      onLayerSelectWithRectStart={onLayerSelectWithRectStart}
      onLayerSelectWithRectMove={onLayerSelectWithRectMove}
      onLayerSelectWithRectEnd={onLayerSelectWithRectEnd}
      onSketchPluginFeatureCreate={onSketchPluginFeatureCreate}
      onSketchPluginFeatureUpdate={onSketchPluginFeatureUpdate}
      onLayerVisibility={onLayerVisibility}
      onLayerLoad={onLayerLoad}
      onSketchTypeChange={onSketchTypeChange}
      onCameraForceHorizontalRollChange={handleCameraForceHorizontalRollChange}
    >
      <Widgets
        isMobile={viewport?.isMobile}
        isBuilt={isBuilt}
        isEditable={isEditable}
        inEditor={inEditor}
        alignSystem={widgetAlignSystem}
        floatingWidgets={floatingWidgets}
        selectedWidgetArea={selectedWidgetArea}
        editing={widgetAlignSystemEditing}
        layoutConstraint={widgetLayoutConstraint}
        theme={widgetTheme}
        context={widgetContext}
        onWidgetLayoutUpdate={onWidgetLayoutUpdate}
        onAlignmentUpdate={onWidgetAlignmentUpdate}
        onWidgetAreaSelect={onWidgetAreaSelect}
        renderWidget={renderWidget}
      />
      <ModalContainer
        ref={pluginModalContainerRef}
        shownPluginModalInfo={shownPluginModalInfo}
        onPluginModalShow={onPluginModalShow}
      />
      <PopupContainer
        shownPluginPopupInfo={shownPluginPopupInfo}
        ref={pluginPopupContainerRef}
      />
      <Infobox
        key={featuredInfobox?.featureId}
        infobox={featuredInfobox}
        layer={selectedLayer?.layer?.layer}
        installableInfoboxBlocks={installableInfoboxBlocks}
        isEditable={!!inEditor && !featuredInfobox?.readOnly}
        renderBlock={renderBlock}
        onBlockCreate={onInfoboxBlockCreate}
        onBlockDelete={onInfoboxBlockDelete}
        onBlockMove={onInfoboxBlockMove}
        onPropertyUpdate={onPropertyUpdate}
        onPropertyItemAdd={onPropertyItemAdd}
        onPropertyItemDelete={onPropertyItemDelete}
        onPropertyItemMove={onPropertyItemMove}
      />
      {showStoryPanel && (
        <StoryPanel
          ref={storyPanelRef}
          storyWrapperRef={storyWrapperRef}
          selectedStory={selectedStory}
          installableStoryBlocks={installableStoryBlocks}
          isEditable={!!inEditor}
          onStoryPageChange={onStoryPageChange}
          onStoryBlockCreate={onStoryBlockCreate}
          onStoryBlockDelete={onStoryBlockDelete}
          onStoryBlockMove={onStoryBlockMove}
          onPropertyValueUpdate={onPropertyValueUpdate}
          onPropertyItemAdd={onPropertyItemAdd}
          onPropertyItemMove={onPropertyItemMove}
          onPropertyItemDelete={onPropertyItemDelete}
          renderBlock={renderBlock}
          nlsLayers={nlsLayers}
        />
      )}
      <PhotoOverlay
        preview={photoOverlayPreview}
        selectedLayer={selectedLayer?.layer}
        selectedFeature={selectedComputedFeature}
        mapRef={mapRef}
        nlsLayers={nlsLayers}
        currentCameraRef={currentCameraRef}
      />
      <SketchTooltip sketchFeatureTooltip={sketchFeatureTooltip} />
    </Plugins>
  );
}
