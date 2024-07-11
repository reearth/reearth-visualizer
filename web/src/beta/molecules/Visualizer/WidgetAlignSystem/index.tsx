import React, { useMemo } from "react";
import { GridWrapper } from "react-align";

import { WidgetAreaState } from "@reearth/classic/components/organisms/EarthEditor/PropertyPane/hooks";
import { styled } from "@reearth/services/theme";

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
import { filterSections } from "./utils";
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
  invisibleWidgetIDs?: string[];
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
  onVisibilityChange?: (widgetId: string, visible: boolean) => void;
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
  invisibleWidgetIDs,
  onWidgetUpdate,
  onWidgetAlignSystemUpdate,
  onWidgetAlignAreaSelect,
  ...props
}) => {
  const { handleMove, handleExtend, handleAlignmentChange } = useHooks({
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
  });

  const hasInner = useMemo(() => {
    if (!alignSystem?.inner) {
      return;
    }
    return !!filterSections(alignSystem?.inner, invisibleWidgetIDs).length;
  }, [alignSystem, invisibleWidgetIDs]);

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
            {hasInner && (
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
  z-index: ${({ theme }) => theme.classic.zIndexes.base};
  position: absolute;
  pointer-events: ${({ editorMode }) => (editorMode ? "auto" : "none")};
`;
