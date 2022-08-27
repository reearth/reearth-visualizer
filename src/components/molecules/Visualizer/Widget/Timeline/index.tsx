import TimelineUI from "@reearth/components/atoms/Timeline";
import { ComponentProps as WidgetProps } from "@reearth/components/molecules/Visualizer/Widget";
import { styled } from "@reearth/theme";

import { useTimeline } from "./hooks";

export type Props = WidgetProps;

const Timeline = ({ widget, sceneProperty }: Props): JSX.Element | null => {
  const { isOpened, currentTime, range, speed, events } = useTimeline();

  return (
    <Widget extended={!!widget?.extended?.horizontally}>
      <TimelineUI
        isOpened={isOpened}
        currentTime={currentTime}
        range={range}
        sceneProperty={sceneProperty}
        speed={speed}
        {...events}
      />
    </Widget>
  );
};

const Widget = styled.div<{
  extended?: boolean;
}>`
  max-width: 100vw;
  width: ${({ extended }) => (extended ? "100%" : "720px")};

  @media (max-width: 560px) {
    width: ${({ extended }) => (extended ? "100%" : "90vw")};
  }
`;

export default Timeline;
