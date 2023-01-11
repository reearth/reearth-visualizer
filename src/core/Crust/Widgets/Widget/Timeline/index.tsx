import TimelineUI from "@reearth/components/atoms/Timeline";
import { styled } from "@reearth/theme";

import type { ComponentProps as WidgetProps } from "..";

import { useTimeline } from "./hooks";

export type Props = WidgetProps<Property>;

export type Property = {};

const Timeline = ({
  widget,
  theme,
  onExtend,
  context: { clock, onPlay, onPause, onSpeedChange, onTimeChange, onTick } = {},
}: Props): JSX.Element | null => {
  const { isOpened, currentTime, range, speed, events } = useTimeline({
    widgetId: widget.id,
    clock,
    onPlay,
    onPause,
    onSpeedChange,
    onTimeChange,
    onTick,
    onExtend,
  });

  return (
    <Widget extended={!!widget?.extended?.horizontally} opened={isOpened}>
      <TimelineUI
        isOpened={isOpened}
        currentTime={currentTime}
        range={range}
        theme={theme}
        speed={speed}
        {...events}
      />
    </Widget>
  );
};

const Widget = styled.div<{
  extended?: boolean;
  opened?: boolean;
}>`
  max-width: 100vw;
  width: ${({ extended, opened }) => (extended && opened ? "100%" : opened ? "720px" : "auto")};

  @media (max-width: 560px) {
    width: ${({ extended, opened }) => (extended && opened ? "100%" : opened ? "90vw" : "auto")};
  }
`;

export default Timeline;
