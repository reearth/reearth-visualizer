import { ReactNode, useState, useMemo, useEffect } from "react";
import { GridSection } from "react-align";

import Icon from "@reearth/components/atoms/Icon";
import Slide from "@reearth/components/atoms/Slide";
import { styled } from "@reearth/theme";

import Area from "./Area";
import type { WidgetZone, WidgetLayoutConstraint, Theme, WidgetProps } from "./types";

export type Props = {
  children?: ReactNode;
  zone?: WidgetZone;
  zoneName: "inner" | "outer";
  theme?: Theme;
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  invisibleWidgetIDs?: string[];
  renderWidget?: (props: WidgetProps) => ReactNode;
};

const sections = ["left", "center", "right"] as const;
const areas = ["top", "middle", "bottom"] as const;

export default function MobileZone({
  zone,
  zoneName,
  layoutConstraint,
  theme,
  children,
  invisibleWidgetIDs,
  renderWidget,
}: Props) {
  const filteredSections = useMemo(() => {
    return sections.filter(
      s =>
        areas.filter(a => zone?.[s]?.[a]?.widgets?.find(w => !invisibleWidgetIDs?.includes(w.id)))
          .length ||
        (s === "center" && children),
    );
  }, [zone, children, invisibleWidgetIDs]);

  const initialPos = useMemo(() => (filteredSections.length === 3 ? 1 : 0), [filteredSections]);

  const [pos, setPos] = useState(initialPos);

  useEffect(() => {
    setPos(initialPos);
  }, [initialPos]);

  return (
    <>
      <StyledSlide pos={pos} filteredSections={filteredSections.length > 1}>
        {filteredSections.map(s => (
          <GridSection key={s} stretch>
            {areas.map(a =>
              s === "center" && children && a === "middle" ? (
                <div key={a} style={{ display: "flex", flex: "1 0 auto" }}>
                  {children}
                </div>
              ) : (
                <Area
                  key={a}
                  zone={zoneName}
                  section={s}
                  area={a}
                  widgets={zone?.[s]?.[a]?.widgets}
                  align={zone?.[s]?.[a]?.align ?? "start"}
                  layoutConstraint={layoutConstraint}
                  renderWidget={renderWidget}
                />
              ),
            )}
          </GridSection>
        ))}
      </StyledSlide>
      {filteredSections.length > 1 ? (
        <Controls publishedTheme={theme}>
          <Control leftIcon onClick={() => pos > 0 && setPos(pos - 1)}>
            {pos > 0 && <Icon icon="arrowLongLeft" size={24} color={theme?.mainIcon} />}
          </Control>
          <InnerControlWrapper>
            {filteredSections.map((_, i) => (
              <Control key={i} onClick={() => setPos(i)}>
                <PageIcon current={pos === i} publishedTheme={theme} />
              </Control>
            ))}
          </InnerControlWrapper>
          <Control rightIcon onClick={() => pos < filteredSections.length - 1 && setPos(pos + 1)}>
            {pos < filteredSections.length - 1 && (
              <Icon icon="arrowLongRight" size={24} color={theme?.mainIcon} />
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

const Controls = styled.div<{ publishedTheme?: Theme }>`
  position: absolute;
  bottom: 0;
  height: 32px;
  width: 100%;
  background: ${({ publishedTheme }) => publishedTheme?.background};
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

const PageIcon = styled.div<{ current?: boolean; publishedTheme?: Theme }>`
  border: 1px solid ${({ publishedTheme }) => publishedTheme?.mainIcon};
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ current, publishedTheme }) => (current ? publishedTheme?.mainIcon : null)};
`;
