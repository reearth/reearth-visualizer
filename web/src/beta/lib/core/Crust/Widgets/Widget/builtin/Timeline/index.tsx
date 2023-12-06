import TimelineUI from "@reearth/beta/lib/core/Crust/Widgets/Widget/builtin/Timeline/UI";
import { styled } from "@reearth/services/theme";

import type { ComponentProps as WidgetProps } from "../..";

import { useTimeline } from "./hooks";

export type Props = WidgetProps;

const Timeline = ({
  widget,
  theme,
  isMobile,
  onExtend,
  context: {
    timelineManagerRef,
    onPlay,
    onPause,
    onSpeedChange,
    onTimeChange,
    onTick,
    removeTickEventListener,
  } = {},
}: Props): JSX.Element | null => {
  const { isOpened, currentTime, range, speed, events } = useTimeline({
    widget,
    timelineManagerRef,
    isMobile,
    onPlay,
    onPause,
    onSpeedChange,
    onTimeChange,
    onTick,
    removeTickEventListener,
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

  @media (max-width: 768px) {
    width: ${({ extended, opened }) => (extended && opened ? "100%" : opened ? "90vw" : "auto")};
  }
`;

export default Timeline;
