import { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

import DropHolder from "@reearth/classic/components/atoms/DropHolder";
import Filled from "@reearth/classic/components/atoms/Filled";
import Loading from "@reearth/classic/components/atoms/Loading";
import { WidgetAreaState } from "@reearth/classic/components/organisms/EarthEditor/PropertyPane/hooks";
import { LatLng } from "@reearth/classic/util/value";
import { styled } from "@reearth/services/theme";

import Engine, { Props as EngineProps, SceneProperty, ClusterProperty } from "./Engine";
import Err from "./Error";
import useHooks from "./hooks";
import Infobox, { Props as InfoboxProps } from "./Infobox";
import Layers, { LayerStore, Layer } from "./Layers";
import { Provider } from "./Plugin";
import ModalContainer from "./Plugin/ModalContainer";
import PopupContainer from "./Plugin/PopupContainer";
import type { Tag } from "./Plugin/types";
import W from "./Widget";
import type { Widget } from "./Widget";
import {
  BuiltinWidgets,
  NAVIGATOR_BUILTIN_WIDGET_ID,
  TIMELINE_BUILTIN_WIDGET_ID,
} from "./Widget/builtin";
import WidgetAlignSystem, {
  Props as WidgetAlignSystemProps,
  WidgetAlignSystem as WidgetAlignSystemType,
} from "./WidgetAlignSystem";

export type { SceneProperty, ClusterProperty } from "./Engine";
export type { InfoboxProperty, Block } from "./Infobox";
export type { Layer } from "./Layers";
export type { Tag } from "./Plugin/types";
export type {
  Widget,
  Alignment,
  Location,
  WidgetAlignSystem,
  WidgetLayout,
  WidgetArea,
  WidgetSection,
  WidgetZone,
  WidgetLayoutConstraint,
} from "./WidgetAlignSystem";
export { LayerStore };

export type Props = {
  children?: ReactNode;
  rootLayerId?: string;
  rootLayer?: Layer;
  widgets?: {
    floatingWidgets?: Widget[];
    alignSystem?: WidgetAlignSystemType;
    layoutConstraint?: WidgetAlignSystemProps["layoutConstraint"];
    ownBuiltinWidgets?: (keyof BuiltinWidgets<boolean>)[];
  };
  sceneProperty?: SceneProperty;
  tags?: Tag[];
  pluginProperty?: { [key: string]: any };
  clusterProperty?: ClusterProperty[];
  selectedLayerId?: string;
  zoomedLayerId?: string;
  selectedBlockId?: string;
  selectedWidgetArea?: WidgetAreaState;
  pluginBaseUrl?: string;
  isPublished?: boolean;
  inEditor?: boolean;
  widgetAlignEditorActivated?: boolean;
  engineMeta?: Record<string, unknown>;
  onWidgetUpdate?: WidgetAlignSystemProps["onWidgetUpdate"];
  onWidgetAlignSystemUpdate?: WidgetAlignSystemProps["onWidgetAlignSystemUpdate"];
  renderInfoboxInsertionPopUp?: InfoboxProps["renderInsertionPopUp"];
  onLayerSelect?: (id?: string) => void;
  onLayerDrop?: (layer: Layer, key: string, latlng: LatLng) => void;
  onZoomToLayer?: (layerId: string | undefined) => void;
  onWidgetAlignAreaSelect?: (widgetAreaState?: WidgetAreaState) => void;
} & Omit<EngineProps, "children" | "property" | "onLayerSelect" | "onLayerDrop"> &
  Pick<
    InfoboxProps,
    "onBlockChange" | "onBlockDelete" | "onBlockMove" | "onBlockInsert" | "onBlockSelect"
  >;

export default function Visualizer({
  ready,
  rootLayerId,
  rootLayer,
  widgets,
  sceneProperty,
  tags,
  children,
  pluginProperty,
  clusterProperty,
  pluginBaseUrl,
  isPublished,
  inEditor,
  selectedLayerId: outerSelectedLayerId,
  selectedBlockId: outerSelectedBlockId,
  selectedWidgetArea,
  zoomedLayerId,
  widgetAlignEditorActivated,
  engineMeta,
  onLayerSelect,
  onWidgetUpdate,
  onWidgetAlignSystemUpdate,
  renderInfoboxInsertionPopUp,
  onBlockChange,
  onBlockDelete,
  onBlockMove,
  onBlockInsert,
  onBlockSelect,
  onLayerDrop,
  onZoomToLayer,
  onWidgetAlignAreaSelect,
  ...props
}: Props): JSX.Element {
  const {
    engineRef,
    wrapperRef,
    isDroppable,
    providerProps,
    selectedLayerId,
    selectedLayer,
    layers,
    layerSelectionReason,
    layerOverriddenProperties,
    isLayerDragging,
    selectedBlockId,
    innerCamera,
    innerClock,
    infobox,
    overriddenSceneProperty,
    pluginModalContainerRef,
    shownPluginModalInfo,
    pluginPopupContainerRef,
    shownPluginPopupInfo,
    overriddenAlignSystem,
    viewport,
    invisibleWidgetIDs,
    onPluginWidgetVisibilityChange,
    onPluginModalShow,
    onPluginPopupShow,
    isLayerHidden,
    selectLayer,
    selectBlock,
    changeBlock,
    updateCamera,
    updateClock,
    handleLayerDrag,
    handleLayerDrop,
    handleInfoboxMaskClick,
  } = useHooks({
    engineType: props.engine,
    rootLayerId,
    isEditable: props.isEditable,
    isBuilt: props.isBuilt,
    isPublished,
    inEditor,
    rootLayer,
    selectedLayerId: outerSelectedLayerId,
    selectedBlockId: outerSelectedBlockId,
    zoomedLayerId,
    camera: props.camera,
    clock: props.clock,
    sceneProperty,
    tags,
    alignSystem: widgets?.alignSystem,
    floatingWidgets: widgets?.floatingWidgets,
    onLayerSelect,
    onBlockSelect,
    onBlockChange,
    onCameraChange: props.onCameraChange,
    onTick: props.onTick,
    onLayerDrop,
    onZoomToLayer,
  });

  return (
    <ErrorBoundary FallbackComponent={Err}>
      <Provider {...providerProps}>
        <Filled ref={wrapperRef}>
          {isDroppable && <DropHolder />}
          {ready && widgets?.alignSystem && (
            <WidgetAlignSystem
              selectedWidgetArea={selectedWidgetArea}
              alignSystem={overriddenAlignSystem}
              editing={widgetAlignEditorActivated}
              onWidgetUpdate={onWidgetUpdate}
              onWidgetAlignSystemUpdate={onWidgetAlignSystemUpdate}
              sceneProperty={overriddenSceneProperty}
              pluginProperty={pluginProperty}
              pluginModalContainer={pluginModalContainerRef.current}
              shownPluginModalInfo={shownPluginModalInfo}
              onPluginModalShow={onPluginModalShow}
              pluginPopupContainer={pluginPopupContainerRef.current}
              shownPluginPopupInfo={shownPluginPopupInfo}
              onPluginPopupShow={onPluginPopupShow}
              isEditable={props.isEditable}
              isBuilt={props.isBuilt}
              viewport={viewport}
              pluginBaseUrl={pluginBaseUrl}
              layoutConstraint={widgets.layoutConstraint}
              onWidgetAlignAreaSelect={onWidgetAlignAreaSelect}
              invisibleWidgetIDs={invisibleWidgetIDs}
              onVisibilityChange={onPluginWidgetVisibilityChange}
            />
          )}
          <Engine
            ref={engineRef}
            property={overriddenSceneProperty}
            selectedLayerId={selectedLayer?.id}
            layerSelectionReason={layerSelectionReason}
            ready={ready}
            camera={innerCamera}
            clock={innerClock}
            isLayerDragging={isLayerDragging}
            isLayerDraggable={props.isEditable}
            shouldRender={
              !!widgets?.ownBuiltinWidgets?.includes(TIMELINE_BUILTIN_WIDGET_ID) ||
              !!widgets?.ownBuiltinWidgets?.includes(NAVIGATOR_BUILTIN_WIDGET_ID)
            }
            meta={engineMeta}
            inEditor={inEditor}
            onLayerSelect={selectLayer}
            onCameraChange={updateCamera}
            onTick={updateClock}
            onLayerDrop={handleLayerDrop}
            onLayerDrag={handleLayerDrag}
            {...props}>
            <Layers
              isEditable={props.isEditable}
              isBuilt={props.isBuilt}
              pluginProperty={pluginProperty}
              clusterProperty={clusterProperty}
              sceneProperty={overriddenSceneProperty}
              pluginBaseUrl={pluginBaseUrl}
              selectedLayerId={selectedLayerId}
              meta={engineMeta}
              layers={layers}
              isLayerHidden={isLayerHidden}
              overriddenProperties={layerOverriddenProperties}
              clusterComponent={engineRef.current?.clusterComponent}
            />
            {ready &&
              widgets?.floatingWidgets?.map(widget => (
                <W
                  key={widget.id}
                  widget={widget}
                  sceneProperty={overriddenSceneProperty}
                  pluginProperty={
                    widget.pluginId && widget.extensionId
                      ? pluginProperty?.[`${widget.pluginId}/${widget.extensionId}`]
                      : undefined
                  }
                  pluginModalContainer={pluginModalContainerRef.current}
                  shownPluginModalInfo={shownPluginModalInfo}
                  onPluginModalShow={onPluginModalShow}
                  pluginPopupContainer={pluginPopupContainerRef.current}
                  shownPluginPopupInfo={shownPluginPopupInfo}
                  onPluginPopupShow={onPluginPopupShow}
                  isEditable={props.isEditable}
                  isBuilt={props.isBuilt}
                  inEditor={inEditor}
                  pluginBaseUrl={pluginBaseUrl}
                  viewport={viewport}
                />
              ))}
          </Engine>
          {ready && (
            <>
              <ModalContainer
                shownPluginModalInfo={shownPluginModalInfo}
                onPluginModalShow={onPluginModalShow}
                ref={pluginModalContainerRef}
              />
              <PopupContainer
                shownPluginPopupInfo={shownPluginPopupInfo}
                ref={pluginPopupContainerRef}
              />
              <Infobox
                title={infobox?.title}
                infoboxKey={infobox?.infoboxKey}
                visible={!!infobox?.visible}
                sceneProperty={overriddenSceneProperty}
                blocks={infobox?.blocks}
                layer={infobox?.layer}
                selectedBlockId={selectedBlockId}
                pluginProperty={pluginProperty}
                isBuilt={props.isBuilt}
                isEditable={props.isEditable && !!infobox?.isEditable}
                onBlockChange={changeBlock}
                onBlockDelete={onBlockDelete}
                onBlockMove={onBlockMove}
                onBlockInsert={onBlockInsert}
                onBlockSelect={selectBlock}
                renderInsertionPopUp={renderInfoboxInsertionPopUp}
                pluginBaseUrl={pluginBaseUrl}
                onMaskClick={handleInfoboxMaskClick}
                pluginModalContainer={pluginModalContainerRef.current}
                shownPluginModalInfo={shownPluginModalInfo}
                onPluginModalShow={onPluginModalShow}
                pluginPopupContainer={pluginPopupContainerRef.current}
                shownPluginPopupInfo={shownPluginPopupInfo}
                onPluginPopupShow={onPluginPopupShow}
                viewport={viewport}
              />
            </>
          )}
          {children}
          {!ready && (
            <LoadingWrapper>
              <Loading />
            </LoadingWrapper>
          )}
        </Filled>
      </Provider>
    </ErrorBoundary>
  );
}

const LoadingWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: ${({ theme }) => theme.classic.zIndexes.loading};
`;
