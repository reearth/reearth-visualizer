import { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";

import Timeline, { Props } from ".";

export default {
  component: Timeline
} as Meta;

export const Normal: StoryFn<Props> = () => (
  <Timeline
    currentTime={new Date("2022-06-30T12:20:00.000").getTime()}
    range={{
      start: new Date("2022-06-30T21:00:00.000").getTime(),
      end: new Date("2022-07-03T12:21:21.221").getTime()
    }}
    isOpened={true}
  />
);

export const DefaultRange: StoryFn<Props> = () => (
  <Timeline
    // Forward a hour
    currentTime={Date.now() + 3600000}
    isOpened={true}
  />
);

export const Movable: StoryFn<Props> = () => {
  // Forward a hour
  const [currentTime, setCurrentTime] = useState(() => Date.now() + 3600000);
  const [isOpened, setIsOpened] = useState(false);
  return (
    <Timeline
      currentTime={currentTime}
      onClick={setCurrentTime}
      onDrag={setCurrentTime}
      isOpened={isOpened}
      onOpen={() => setIsOpened(true)}
      onClose={() => setIsOpened(false)}
    />
  );
};
