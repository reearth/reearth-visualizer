import TimelineUI from "@reearth/components/atoms/Timeline";
import { styled } from "@reearth/theme";

import type { ComponentProps as WidgetProps } from "..";
import { Visible } from "../useVisible";

import { useTimeline } from "./hooks";

export type Props = WidgetProps<Property>;

export type Property = {
  default: {
    visible: Visible;
  };
};

const Timeline = ({
  widget,
  theme,
  isMobile,
  onExtend,
  onVisibilityChange,
  context: {
    clock,
    onPlay,
    onPause,
    onSpeedChange,
    onTimeChange,
    onTick,
    removeTickEventListener,
  } = {},
}: Props): JSX.Element | null => {
  const { isOpened, currentTime, range, speed, events, visible } = useTimeline({
    widget,
    clock,
    isMobile,
    onPlay,
    onPause,
    onSpeedChange,
    onTimeChange,
    onTick,
    removeTickEventListener,
    onExtend,
    onVisibilityChange,
  });

  return visible ? (
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
  ) : null;
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
