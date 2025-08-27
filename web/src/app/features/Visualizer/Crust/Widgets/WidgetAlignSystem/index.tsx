import { styled } from "@reearth/services/theme";
import React, { ReactNode } from "react";
import { GridWrapper } from "react-align";

import useHooks from "./hooks";
import type {
  WidgetAlignSystem as WidgetAlignSystemType,
  Alignment,
  Location,
  WidgetLayoutConstraint,
  Theme,
  WidgetProps
} from "./types";
import ZoneComponent, { WidgetAreaType } from "./Zone";

export type { WidgetAreaType };

export type {
  WidgetAlignSystem,
  WidgetLayout,
  Location,
  Alignment,
  WidgetArea,
  WidgetSection,
  WidgetZone,
  WidgetLayoutConstraint,
  Theme,
  WidgetProps,
  InternalWidget
} from "./types";

export type Props = {
  alignSystem?: WidgetAlignSystemType;
  selectedWidgetArea?: WidgetAreaType;
  invisibleWidgetIDs?: string[];
  editing?: boolean;
  layoutConstraint?: Record<string, WidgetLayoutConstraint>;
  isMobile?: boolean;
  theme?: Theme;
  renderWidget?: (props: WidgetProps) => ReactNode;
  onWidgetLayoutUpdate?: (
    id: string,
    update: {
      location?: Location;
      extended?: boolean;
      index?: number;
    }
  ) => void;
  onWidgetAreaSelect?: (widgetArea?: WidgetAreaType) => void;
  onAlignmentUpdate?: (location: Location, align: Alignment) => void;
};

const WidgetAlignSystem: React.FC<Props> = ({
  alignSystem,
  selectedWidgetArea,
  invisibleWidgetIDs,
  editing,
  isMobile,
  layoutConstraint,
  renderWidget,
  onWidgetAreaSelect,
  onWidgetLayoutUpdate: onWidgetLayoutUpdate,
  onAlignmentUpdate: onAlignmentUpdate
}) => {
  const { handleMove, handleExtend, handleAlignmentChange } = useHooks({
    onWidgetLayoutUpdate,
    onAlignmentUpdate
  });

  return (
    <WidetAlignSystemWrapper editorMode={editing}>
      <GridWrapper
        editing={editing}
        onMove={handleMove}
        onAlignChange={handleAlignmentChange}
        onExtend={handleExtend}
      >
        <ZoneComponent
          zoneName="outer"
          selectedWidgetArea={selectedWidgetArea}
          zone={alignSystem?.outer}
          layoutConstraint={layoutConstraint}
          invisibleWidgetIDs={invisibleWidgetIDs}
          isMobile={isMobile}
          renderWidget={renderWidget}
          onWidgetAreaSelect={onWidgetAreaSelect}
        >
          <ZoneComponent
            zoneName="inner"
            selectedWidgetArea={selectedWidgetArea}
            invisibleWidgetIDs={invisibleWidgetIDs}
            zone={alignSystem?.inner}
            layoutConstraint={layoutConstraint}
            isMobile={isMobile}
            renderWidget={renderWidget}
            onWidgetAreaSelect={onWidgetAreaSelect}
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
  left: 0;
  top: 0;
  z-index: ${({ theme }) => theme.zIndexes.visualizer.widget};
  position: absolute;
  pointer-events: ${({ editorMode }) => (editorMode ? "auto" : "none")};
`;
