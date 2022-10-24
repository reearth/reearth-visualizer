import React from "react";
import { GridWrapper } from "react-align";
import { useMedia } from "react-use";

import { styled } from "@reearth/theme";

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
  alignSystem?: WidgetAlignSystemType;
  editing?: boolean;
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  isEditable?: boolean;
  isBuilt?: boolean;
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
} & PluginCommonProps;

const WidgetAlignSystem: React.FC<Props> = ({
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
  ...props
}) => {
  const { handleMove, handleExtend, handleAlignmentChange } = useHooks({
    onWidgetUpdate,
    onWidgetAlignSystemUpdate,
  });
  const isSmallWindow = useMedia("(max-width: 768px)");

  return (
    <WidetAlignSystemWrapper editorMode={editing}>
      <GridWrapper
        editing={editing}
        onMove={handleMove}
        onAlignChange={handleAlignmentChange}
        onExtend={handleExtend}>
        {isSmallWindow ? (
          <MobileZone
            zoneName="outer"
            zone={alignSystem?.outer}
            sceneProperty={sceneProperty}
            pluginProperty={pluginProperty}
            pluginBaseUrl={pluginBaseUrl}
            isEditable={isEditable}
            isBuilt={isBuilt}
            layoutConstraint={layoutConstraint}
            {...props}>
            {alignSystem?.inner && (
              <ZoneComponent
                zoneName="inner"
                zone={alignSystem?.inner}
                sceneProperty={sceneProperty}
                pluginProperty={pluginProperty}
                pluginBaseUrl={pluginBaseUrl}
                isEditable={isEditable}
                isBuilt={isBuilt}
                layoutConstraint={layoutConstraint}
                {...props}
              />
            )}
          </MobileZone>
        ) : (
          <ZoneComponent
            zoneName="outer"
            zone={alignSystem?.outer}
            sceneProperty={sceneProperty}
            pluginProperty={pluginProperty}
            pluginBaseUrl={pluginBaseUrl}
            isEditable={isEditable}
            isBuilt={isBuilt}
            layoutConstraint={layoutConstraint}
            {...props}>
            <ZoneComponent
              zoneName="inner"
              zone={alignSystem?.inner}
              sceneProperty={sceneProperty}
              pluginProperty={pluginProperty}
              pluginBaseUrl={pluginBaseUrl}
              isEditable={isEditable}
              isBuilt={isBuilt}
              layoutConstraint={layoutConstraint}
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
