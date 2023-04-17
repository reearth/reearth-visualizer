import React from "react";
import { GridWrapper } from "react-align";

import { WidgetAreaState } from "@reearth/components/organisms/EarthEditor/PropertyPane/hooks";
import { styled } from "@reearth/theme";

import { Viewport } from "../hooks";
import type { CommonProps as PluginCommonProps } from "../Plugin";

import useHooks from "./hooks";
import type {
  WidgetAlignSystem as WidgetAlignSystemType,
  Alignment,
  Location,
  WidgetLayoutConstraint,
} from "./hooks";
import MobileZone from "./MobileZone";
import ZoneComponent from "./Zone";

export type {
  WidgetAlignSystem,
  WidgetLayout,
  Location,
  Alignment,
  Widget,
  WidgetArea,
  WidgetSection,
  WidgetZone,
  WidgetLayoutConstraint,
} from "./hooks";

export type Props = {
  selectedWidgetArea?: WidgetAreaState;
  alignSystem?: WidgetAlignSystemType;
  editing?: boolean;
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  isEditable?: boolean;
  isBuilt?: boolean;
  viewport?: Viewport;
  sceneProperty?: any;
  onWidgetUpdate?: (
    id: string,
    update: {
      location?: Location;
      extended?: boolean;
      index?: number;
    },
  ) => void;
  onWidgetAlignSystemUpdate?: (location: Location, align: Alignment) => void;
  overrideSceneProperty?: (pluginId: string, property: any) => void;
  onWidgetAlignAreaSelect?: (widgetArea?: WidgetAreaState) => void;
} & PluginCommonProps;

const WidgetAlignSystem: React.FC<Props> = ({
  selectedWidgetArea,
  alignSystem,
  editing,
  sceneProperty,
  pluginProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
  layoutConstraint,
  onWidgetUpdate,
  onWidgetAlignSystemUpdate,
  onWidgetAlignAreaSelect,
  ...props
}) => {
  const { handleMove, handleExtend, handleAlignmentChange } = useHooks({
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
  });

  return (
    <WidetAlignSystemWrapper editorMode={editing}>
      <GridWrapper
        editing={editing}
        onMove={handleMove}
        onAlignChange={handleAlignmentChange}
        onExtend={handleExtend}>
        {props.viewport?.isMobile ? (
          <MobileZone
            zoneName="outer"
            isMobileZone={props.viewport.isMobile}
            selectedWidgetArea={selectedWidgetArea}
            zone={alignSystem?.outer}
            sceneProperty={sceneProperty}
            pluginProperty={pluginProperty}
            pluginBaseUrl={pluginBaseUrl}
            isEditable={isEditable}
            isBuilt={isBuilt}
            layoutConstraint={layoutConstraint}
            onWidgetAlignAreaSelect={onWidgetAlignAreaSelect}
            {...props}>
            {alignSystem?.inner && (
              <ZoneComponent
                zoneName="inner"
                isMobileZone={props.viewport.isMobile}
                selectedWidgetArea={selectedWidgetArea}
                zone={alignSystem?.inner}
                sceneProperty={sceneProperty}
                pluginProperty={pluginProperty}
                pluginBaseUrl={pluginBaseUrl}
                isEditable={isEditable}
                isBuilt={isBuilt}
                layoutConstraint={layoutConstraint}
                onWidgetAlignAreaSelect={onWidgetAlignAreaSelect}
                {...props}
              />
            )}
          </MobileZone>
        ) : (
          <ZoneComponent
            zoneName="outer"
            selectedWidgetArea={selectedWidgetArea}
            zone={alignSystem?.outer}
            sceneProperty={sceneProperty}
            pluginProperty={pluginProperty}
            pluginBaseUrl={pluginBaseUrl}
            isEditable={isEditable}
            isBuilt={isBuilt}
            layoutConstraint={layoutConstraint}
            onWidgetAlignAreaSelect={onWidgetAlignAreaSelect}
            {...props}>
            <ZoneComponent
              zoneName="inner"
              selectedWidgetArea={selectedWidgetArea}
              zone={alignSystem?.inner}
              sceneProperty={sceneProperty}
              pluginProperty={pluginProperty}
              pluginBaseUrl={pluginBaseUrl}
              isEditable={isEditable}
              isBuilt={isBuilt}
              layoutConstraint={layoutConstraint}
              onWidgetAlignAreaSelect={onWidgetAlignAreaSelect}
              {...props}
            />
          </ZoneComponent>
        )}
      </GridWrapper>
    </WidetAlignSystemWrapper>
  );
};

export default WidgetAlignSystem;

const WidetAlignSystemWrapper = styled.div<{ editorMode?: boolean }>`
  width: 100%;
  height: 100%;
  z-index: ${({ theme }) => theme.zIndexes.base};
  position: absolute;
  pointer-events: ${({ editorMode }) => (editorMode ? "auto" : "none")};
`;
