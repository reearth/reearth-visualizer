import { ReactNode, useState, useMemo, useEffect } from "react";
import { GridSection } from "react-align";

import Icon from "@reearth/classic/components/atoms/Icon";
import Slide from "@reearth/classic/components/atoms/Slide";
import { WidgetAreaState } from "@reearth/classic/components/organisms/EarthEditor/PropertyPane/hooks";
import { styled, usePublishTheme, PublishTheme } from "@reearth/services/theme";

import { Viewport } from "../hooks";
import type { CommonProps as PluginCommonProps } from "../Plugin";

import Area from "./Area";
import { WAS_AREAS } from "./constants";
import type { WidgetZone, WidgetLayoutConstraint } from "./hooks";
import { filterSections } from "./utils";

export type Props = {
  children?: ReactNode;
  selectedWidgetArea?: WidgetAreaState;
  isMobileZone?: boolean;
  zone?: WidgetZone;
  zoneName: "inner" | "outer";
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  viewport?: Viewport;
  invisibleWidgetIDs?: string[];
  onWidgetAlignAreaSelect?: (widgetArea?: WidgetAreaState) => void;
} & PluginCommonProps;

export default function MobileZone({
  isMobileZone,
  selectedWidgetArea,
  zone,
  zoneName,
  layoutConstraint,
  sceneProperty,
  pluginProperty,
  pluginBaseUrl,
  isEditable,
  isBuilt,
  invisibleWidgetIDs,
  onWidgetAlignAreaSelect,
  children,
  ...props
}: Props) {
  const filteredSections = useMemo(() => {
    return filterSections(zone, invisibleWidgetIDs, s => s === "center" && children);
  }, [zone, children, invisibleWidgetIDs]);

  const initialPos = useMemo(() => (filteredSections.length === 3 ? 1 : 0), [filteredSections]);

  const [pos, setPos] = useState(initialPos);
  const publishedTheme = usePublishTheme(sceneProperty.theme);

  useEffect(() => {
    setPos(initialPos);
  }, [initialPos]);

  return (
    <>
      <StyledSlide pos={pos} filteredSections={filteredSections.length > 1}>
        {filteredSections.map(s => (
          <GridSection key={s} stretch>
            {WAS_AREAS.map(a =>
              s === "center" && children && a === "middle" ? (
                <div key={a} style={{ display: "flex", flex: "1 0 auto" }}>
                  {children}
                </div>
              ) : (
                <Area
                  key={a}
                  selectedWidgetArea={selectedWidgetArea}
                  zone={zoneName}
                  section={s}
                  area={a}
                  isMobileZone={isMobileZone}
                  widgets={zone?.[s]?.[a]?.widgets}
                  align={zone?.[s]?.[a]?.align ?? "start"}
                  padding={zone?.[s]?.[a]?.padding ?? { top: 6, bottom: 6, left: 6, right: 6 }}
                  backgroundColor={zone?.[s]?.[a]?.background ?? "unset"}
                  gap={zone?.[s]?.[a]?.gap ?? 6}
                  centered={zone?.[s]?.[a]?.centered ?? false}
                  layoutConstraint={layoutConstraint}
                  sceneProperty={sceneProperty}
                  pluginProperty={pluginProperty}
                  pluginBaseUrl={pluginBaseUrl}
                  isEditable={isEditable}
                  isBuilt={isBuilt}
                  onWidgetAlignAreaSelect={onWidgetAlignAreaSelect}
                  {...props}
                />
              ),
            )}
          </GridSection>
        ))}
      </StyledSlide>
      {filteredSections.length > 1 ? (
        <Controls publishedTheme={publishedTheme}>
          <Control leftIcon onClick={() => pos > 0 && setPos(pos - 1)}>
            {pos > 0 && <Icon icon="arrowLongLeft" size={24} color={publishedTheme.mainIcon} />}
          </Control>
          <InnerControlWrapper>
            {filteredSections.map((_, i) => (
              <Control key={i} onClick={() => setPos(i)}>
                <PageIcon current={pos === i} publishedTheme={publishedTheme} />
              </Control>
            ))}
          </InnerControlWrapper>
          <Control rightIcon onClick={() => pos < filteredSections.length - 1 && setPos(pos + 1)}>
            {pos < filteredSections.length - 1 && (
              <Icon icon="arrowLongRight" size={24} color={publishedTheme.mainIcon} />
            )}
          </Control>
        </Controls>
      ) : null}
    </>
  );
}

const StyledSlide = styled(Slide)<{ filteredSections?: boolean }>`
  height: calc(100% ${({ filteredSections }) => filteredSections && "- 32px"});
`;

const Controls = styled.div<{ publishedTheme: PublishTheme }>`
  position: absolute;
  bottom: 0;
  height: 32px;
  width: 100%;
  background: ${({ publishedTheme }) => publishedTheme.background};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InnerControlWrapper = styled.div`
  display: flex;
`;

const Control = styled.div<{ leftIcon?: boolean; rightIcon?: boolean }>`
  height: 100%;
  flex: 1;
  display: flex;
  justify-content: ${({ leftIcon, rightIcon }) =>
    leftIcon ? "flex-start" : rightIcon ? "flex-end" : undefined};
  align-items: center;
  cursor: pointer;
  pointer-events: auto;
  padding: 0 8px;
  transition: all 0.2s ease-in-out 0.1s;
`;

const PageIcon = styled.div<{ current?: boolean; publishedTheme?: PublishTheme }>`
  border: 1px solid ${({ publishedTheme }) => publishedTheme?.mainIcon};
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ current, publishedTheme }) => (current ? publishedTheme?.mainIcon : null)};
`;
