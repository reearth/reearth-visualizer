import React, { PropsWithChildren } from "react";

import DropHolder from "@reearth/components/atoms/DropHolder";
import Filled from "@reearth/components/atoms/Filled";
import Loading from "@reearth/components/atoms/Loading";
import { styled } from "@reearth/theme";

import { Provider } from "./context";
import Engine, { Props as EngineProps, SceneProperty } from "./Engine";
import useHooks from "./hooks";
import Infobox, { Block as BlockType, InfoboxProperty, Props as InfoboxProps } from "./Infobox";
import P, { Primitive as PrimitiveType } from "./Primitive";
import W, { Widget as WidgetType } from "./Widget";
import WidgetAlignSystem, {
  Props as WidgetAlignSystemProps,
  WidgetAlignSystem as WidgetAlignSystemType,
} from "./WidgetAlignSystem";

export type { VisualizerContext } from "./context";
export type { SceneProperty } from "./Engine";
export type {
  Alignment,
  Location,
  WidgetAlignSystem,
  WidgetLayout,
  WidgetArea,
  WidgetSection,
  WidgetZone,
  WidgetLayoutConstraint,
} from "./WidgetAlignSystem";

export type Infobox = {
  blocks?: Block[];
  property?: InfoboxProperty;
};

export type Primitive = PrimitiveType & {
  infoboxEditable?: boolean;
  pluginProperty?: any;
  hidden?: boolean;
};

export type Widget = WidgetType & {
  pluginProperty?: any;
};

export type Block = BlockType;

export type Props = PropsWithChildren<
  {
    rootLayerId?: string;
    primitives?: Primitive[];
    widgets?: {
      floatingWidgets: Widget[];
      alignSystem?: WidgetAlignSystemType;
      layoutConstraint?: WidgetAlignSystemProps["layoutConstraint"];
    };
    sceneProperty?: SceneProperty;
    selectedBlockId?: string;
    pluginBaseUrl?: string;
    isPublished?: boolean;
    widgetAlignEditorActivated?: boolean;
    onWidgetUpdate?: WidgetAlignSystemProps["onWidgetUpdate"];
    onWidgetAlignSystemUpdate?: WidgetAlignSystemProps["onWidgetAlignSystemUpdate"];
    renderInfoboxInsertionPopUp?: InfoboxProps["renderInsertionPopUp"];
    onPrimitiveSelect?: (id?: string) => void;
  } & Omit<EngineProps, "children" | "property" | "onPrimitiveSelect"> &
    Pick<
      InfoboxProps,
      "onBlockChange" | "onBlockDelete" | "onBlockMove" | "onBlockInsert" | "onBlockSelect"
    >
>;

export default function Visualizer({
  ready,
  rootLayerId,
  primitives,
  widgets,
  sceneProperty,
  selectedPrimitiveId: outerSelectedPrimitiveId,
  selectedBlockId: outerSelectedBlockId,
  children,
  pluginBaseUrl,
  isPublished,
  widgetAlignEditorActivated,
  onWidgetUpdate,
  onWidgetAlignSystemUpdate,
  onPrimitiveSelect,
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
    hiddenPrimitives,
    visualizerContext,
    selectedPrimitive,
    selectedPrimitiveId,
    primitiveSelectionReason,
    selectedBlockId,
    innerCamera,
    infobox,
    selectPrimitive,
    selectBlock,
    updateCamera,
  } = useHooks({
    engineType: props.engine,
    rootLayerId,
    isEditable: props.isEditable,
    isBuilt: props.isBuilt,
    isPublished,
    primitives,
    selectedPrimitiveId: outerSelectedPrimitiveId,
    selectedBlockId: outerSelectedBlockId,
    camera: props.camera,
    sceneProperty,
    onPrimitiveSelect,
    onBlockSelect,
    onCameraChange: props.onCameraChange,
  });

  return (
    <Provider value={visualizerContext}>
      <Filled ref={wrapperRef}>
        {isDroppable && <DropHolder />}
        {ready && widgets?.alignSystem && (
          <WidgetAlignSystem
            alignSystem={widgets.alignSystem}
            enabled={widgetAlignEditorActivated}
            onWidgetUpdate={onWidgetUpdate}
            onWidgetAlignSystemUpdate={onWidgetAlignSystemUpdate}
            sceneProperty={sceneProperty}
            isEditable={props.isEditable}
            isBuilt={props.isBuilt}
            pluginBaseUrl={pluginBaseUrl}
            layoutConstraint={widgets.layoutConstraint}
          />
        )}
        <Engine
          ref={engineRef}
          property={sceneProperty}
          selectedPrimitiveId={selectedPrimitive?.id}
          primitiveSelectionReason={primitiveSelectionReason}
          onPrimitiveSelect={selectPrimitive}
          ready={ready}
          {...props}
          camera={innerCamera}
          onCameraChange={updateCamera}>
          {primitives?.map(primitive =>
            primitive.hidden ? null : (
              <P
                key={primitive.id}
                primitive={primitive}
                sceneProperty={sceneProperty}
                pluginProperty={primitive.pluginProperty}
                isHidden={hiddenPrimitives.includes(primitive.id)}
                isEditable={props.isEditable}
                isBuilt={props.isBuilt}
                isSelected={!!selectedPrimitiveId && selectedPrimitiveId === primitive.id}
                pluginBaseUrl={pluginBaseUrl}
              />
            ),
          )}
          {ready &&
            widgets?.floatingWidgets.map(widget => (
              <W
                key={widget.id}
                widget={widget}
                sceneProperty={sceneProperty}
                pluginProperty={widget.pluginProperty}
                isEditable={props.isEditable}
                isBuilt={props.isBuilt}
                pluginBaseUrl={pluginBaseUrl}
                widgetLayout={{ floating: true }}
              />
            ))}
        </Engine>
        {ready && (
          <Infobox
            title={infobox?.title}
            infoboxKey={infobox?.infoboxKey}
            visible={!!infobox?.visible}
            property={infobox?.property}
            sceneProperty={sceneProperty}
            primitive={infobox?.primitive}
            blocks={infobox?.blocks}
            selectedBlockId={selectedBlockId}
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
