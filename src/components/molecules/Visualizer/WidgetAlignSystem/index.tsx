import React from "react";
import { GridWrapper } from "react-align";

import { styled } from "@reearth/theme";

import useHooks from "./hooks";
import type {
  WidgetAlignSystem as WidgetAlignSystemType,
  Alignment,
  Location,
  WidgetLayoutConstraint,
} from "./hooks";
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
  enabled?: boolean;
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  pluginProperty?: { [key: string]: any };
  pluginBaseUrl?: string;
  onWidgetUpdate?: (
    id: string,
    update: {
      location?: Location;
      extended?: boolean;
      index?: number;
    },
  ) => void;
  onWidgetAlignSystemUpdate?: (location: Location, align: Alignment) => void;
};

const WidgetAlignSystem: React.FC<Props> = ({
  alignSystem,
  enabled,
  sceneProperty,
  pluginProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
  layoutConstraint,
  onWidgetUpdate,
  onWidgetAlignSystemUpdate,
}) => {
  const { onReorder, onMove, onExtend } = useHooks({
    onWidgetUpdate,
  });

  return (
    <WidetAlignSystemWrapper editorMode={enabled}>
      <GridWrapper enabled={enabled}>
        <ZoneComponent
          zoneName="outer"
          zone={alignSystem?.outer}
          onReorder={onReorder}
          onMove={onMove}
          onAlignChange={onWidgetAlignSystemUpdate}
          onExtend={onExtend}
          sceneProperty={sceneProperty}
          pluginProperty={pluginProperty}
          pluginBaseUrl={pluginBaseUrl}
          isEditable={isEditable}
          isBuilt={isBuilt}
          layoutConstraint={layoutConstraint}>
          <ZoneComponent
            zoneName="inner"
            zone={alignSystem?.inner}
            onReorder={onReorder}
            onMove={onMove}
            onAlignChange={onWidgetAlignSystemUpdate}
            onExtend={onExtend}
            sceneProperty={sceneProperty}
            pluginProperty={pluginProperty}
            pluginBaseUrl={pluginBaseUrl}
            isEditable={isEditable}
            isBuilt={isBuilt}
            layoutConstraint={layoutConstraint}
          />
        </ZoneComponent>
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
