import React, { ReactNode, useMemo } from "react";
import { GridWrapper } from "react-align";

import { styled } from "@reearth/theme";

import useHooks from "./hooks";
import MobileZone from "./MobileZone";
import type {
  WidgetAlignSystem as WidgetAlignSystemType,
  Alignment,
  Location,
  WidgetLayoutConstraint,
  Theme,
  WidgetProps,
} from "./types";
import { filterSections } from "./utils";
import ZoneComponent from "./Zone";

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
  InternalWidget,
} from "./types";

export type Props = {
  alignSystem?: WidgetAlignSystemType;
  invisibleWidgetIDs?: string[];
  editing?: boolean;
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  isMobile?: boolean;
  theme?: Theme;
  renderWidget?: (props: WidgetProps) => ReactNode;
  onWidgetLayoutUpdate?: (
    id: string,
    update: {
      location?: Location;
      extended?: boolean;
      index?: number;
    },
  ) => void;
  onAlignmentUpdate?: (location: Location, align: Alignment) => void;
};

const WidgetAlignSystem: React.FC<Props> = ({
  alignSystem,
  invisibleWidgetIDs,
  editing,
  isMobile,
  layoutConstraint,
  theme,
  renderWidget,
  onWidgetLayoutUpdate: onWidgetLayoutUpdate,
  onAlignmentUpdate: onAlignmentUpdate,
}) => {
  const { handleMove, handleExtend, handleAlignmentChange } = useHooks({
    onWidgetLayoutUpdate,
    onAlignmentUpdate,
  });
  const Zone = isMobile ? MobileZone : ZoneComponent;

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
        <Zone
          zoneName="outer"
          zone={alignSystem?.outer}
          layoutConstraint={layoutConstraint}
          invisibleWidgetIDs={invisibleWidgetIDs}
          theme={theme}
          renderWidget={renderWidget}>
          {(!isMobile || hasInner) && (
            <ZoneComponent
              zoneName="inner"
              invisibleWidgetIDs={invisibleWidgetIDs}
              zone={alignSystem?.inner}
              layoutConstraint={layoutConstraint}
              renderWidget={renderWidget}
            />
          )}
        </Zone>
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
