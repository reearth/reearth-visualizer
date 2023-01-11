import TimelineUI from "@reearth/components/atoms/Timeline";
import { ComponentProps as WidgetProps } from "@reearth/components/molecules/Visualizer/Widget";
import { styled, usePublishTheme } from "@reearth/theme";

import { useTimeline } from "./hooks";

export type Props = WidgetProps;

const Timeline = ({ widget, sceneProperty, onExtend }: Props): JSX.Element | null => {
  const { isOpened, currentTime, range, speed, events } = useTimeline({ widget, onExtend });
  const theme = usePublishTheme(sceneProperty?.theme);

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
