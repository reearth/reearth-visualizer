import React, { PropsWithChildren } from "react";

import DropHolder from "@reearth/components/atoms/DropHolder";
import Filled from "@reearth/components/atoms/Filled";
import Loading from "@reearth/components/atoms/Loading";
import { styled } from "@reearth/theme";

import Engine, { Props as EngineProps, SceneProperty } from "./Engine";
import useHooks from "./hooks";
import Infobox, { Props as InfoboxProps } from "./Infobox";
import Layers, { LayerStore } from "./Layers";
import { Provider } from "./Plugin";
import W from "./Widget";
import type { Widget } from "./Widget";
import WidgetAlignSystem, {
  Props as WidgetAlignSystemProps,
  WidgetAlignSystem as WidgetAlignSystemType,
} from "./WidgetAlignSystem";

export type { SceneProperty } from "./Engine";
export type { InfoboxProperty, Block } from "./Infobox";
export type { Layer } from "./Layers";
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

export type Props = PropsWithChildren<
  {
    rootLayerId?: string;
    layers?: LayerStore;
    widgets?: {
      floatingWidgets?: Widget[];
      alignSystem?: WidgetAlignSystemType;
      layoutConstraint?: WidgetAlignSystemProps["layoutConstraint"];
    };
    sceneProperty?: SceneProperty;
    pluginProperty?: { [key: string]: any };
    selectedLayerId?: string;
    selectedBlockId?: string;
    pluginBaseUrl?: string;
    isPublished?: boolean;
    widgetAlignEditorActivated?: boolean;
    onWidgetUpdate?: WidgetAlignSystemProps["onWidgetUpdate"];
    onWidgetAlignSystemUpdate?: WidgetAlignSystemProps["onWidgetAlignSystemUpdate"];
    renderInfoboxInsertionPopUp?: InfoboxProps["renderInsertionPopUp"];
    onLayerSelect?: (id?: string) => void;
  } & Omit<EngineProps, "children" | "property" | "onLayerSelect"> &
    Pick<
      InfoboxProps,
      "onBlockChange" | "onBlockDelete" | "onBlockMove" | "onBlockInsert" | "onBlockSelect"
    >
>;

export default function Visualizer({
  ready,
  rootLayerId,
  layers,
  widgets,
  sceneProperty,
  children,
  pluginProperty,
  pluginBaseUrl,
  isPublished,
  selectedLayerId: outerSelectedLayerId,
  selectedBlockId: outerSelectedBlockId,
  widgetAlignEditorActivated,
  onLayerSelect,
  onWidgetUpdate,
  onWidgetAlignSystemUpdate,
  renderInfoboxInsertionPopUp,
  onBlockChange,
  onBlockDelete,
  onBlockMove,
  onBlockInsert,
  onBlockSelect,
  ...props
}: Props): JSX.Element {
  const {
    engineRef,
    wrapperRef,
    isDroppable,
    providerProps,
    selectedLayer,
    selectedLayerId,
    layerSelectionReason,
    selectedBlockId,
    innerCamera,
    infobox,
    layeroverriddenProperties,
    isLayerHidden,
    selectLayer,
    selectBlock,
    updateCamera,
  } = useHooks({
    engineType: props.engine,
    rootLayerId,
    isEditable: props.isEditable,
    isBuilt: props.isBuilt,
    isPublished,
    layers,
    selectedLayerId: outerSelectedLayerId,
    selectedBlockId: outerSelectedBlockId,
    camera: props.camera,
    sceneProperty,
    onLayerSelect,
    onBlockSelect,
    onCameraChange: props.onCameraChange,
  });

  return (
    <Provider {...providerProps}>
      <Filled ref={wrapperRef}>
        {isDroppable && <DropHolder />}
        {ready && widgets?.alignSystem && (
          <WidgetAlignSystem
            alignSystem={widgets.alignSystem}
            editing={widgetAlignEditorActivated}
            onWidgetUpdate={onWidgetUpdate}
            onWidgetAlignSystemUpdate={onWidgetAlignSystemUpdate}
            sceneProperty={sceneProperty}
            pluginProperty={pluginProperty}
            isEditable={props.isEditable}
            isBuilt={props.isBuilt}
            pluginBaseUrl={pluginBaseUrl}
            layoutConstraint={widgets.layoutConstraint}
          />
        )}
        <Engine
          ref={engineRef}
          property={sceneProperty}
          selectedLayerId={selectedLayer?.id}
          layerSelectionReason={layerSelectionReason}
          onLayerSelect={selectLayer}
          ready={ready}
          {...props}
          camera={innerCamera}
          onCameraChange={updateCamera}>
          <Layers
            isEditable={props.isEditable}
            isBuilt={props.isBuilt}
            pluginProperty={pluginProperty}
            pluginBaseUrl={pluginBaseUrl}
            selectedLayerId={selectedLayerId}
            layers={layers}
            isLayerHidden={isLayerHidden}
            overriddenProperties={layeroverriddenProperties}
          />
          {ready &&
            widgets?.floatingWidgets?.map(widget => (
              <W
                key={widget.id}
                widget={widget}
                sceneProperty={sceneProperty}
                pluginProperty={
                  widget.pluginId && widget.extensionId
                    ? pluginProperty?.[`${widget.pluginId}/${widget.extensionId}`]
                    : undefined
                }
                isEditable={props.isEditable}
                isBuilt={props.isBuilt}
                pluginBaseUrl={pluginBaseUrl}
              />
            ))}
        </Engine>
        {ready && (
          <Infobox
            title={infobox?.title}
            infoboxKey={infobox?.infoboxKey}
            visible={!!infobox?.visible}
            sceneProperty={sceneProperty}
            blocks={infobox?.blocks}
            layer={infobox?.layer}
            selectedBlockId={selectedBlockId}
            pluginProperty={pluginProperty}
            isBuilt={props.isBuilt}
            isEditable={props.isEditable && !!infobox?.isEditable}
            onBlockChange={onBlockChange}
            onBlockDelete={onBlockDelete}
            onBlockMove={onBlockMove}
            onBlockInsert={onBlockInsert}
            onBlockSelect={selectBlock}
            renderInsertionPopUp={renderInfoboxInsertionPopUp}
            pluginBaseUrl={pluginBaseUrl}
          />
        )}
        {children}
        {!ready && (
          <LoadingWrapper>
            <Loading />
          </LoadingWrapper>
        )}
      </Filled>
    </Provider>
  );
}

const LoadingWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  z-index: ${({ theme }) => theme.zIndexes.loading};
`;
