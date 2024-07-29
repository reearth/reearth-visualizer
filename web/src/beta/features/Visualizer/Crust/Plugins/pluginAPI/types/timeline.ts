export declare type Timeline = {
  startTime?: Date;
  stopTime?: Date;
  currentTime?: Date;
  isPlaying?: boolean;
  speed?: number;
  stepType?: "rate" | "fixed";
  rangeType?: "unbounded" | "clamped" | "bounced";
  readonly tick?: () => Date | undefined;
  readonly play?: () => void;
  readonly pause?: () => void;
  readonly setTime?: (time: {
    start: Date | string;
    stop: Date | string;
    current: Date | string;
  }) => void;
  readonly setSpeed?: (speed: number) => void;
  readonly setStepType?: (stepType: "rate" | "fixed") => void;
  readonly setRangeType?: (rangeType: "unbounded" | "clamped" | "bounced") => void;
  readonly on: TimelineEvents["on"];
  readonly off: TimelineEvents["off"];
};

export declare type TimelineCommitter = {
  source:
    | "widgetContext"
    | "pluginAPI"
    | "featureResource"
    | "storyTimelineBlock"
    | "storyPage"
    | "initialize";
  id?: string;
};

export declare type TimelineEventType = {
  tick: [e: Date];
  commit: [e: TimelineCommitter];
};

export declare type TimelineEvents = {
  readonly on: <T extends keyof TimelineEventType>(
    type: T,
    callback: (...args: TimelineEventType[T]) => void,
    options?: { once?: boolean },
  ) => void;
  readonly off: <T extends keyof TimelineEventType>(
    type: T,
    callback: (...args: TimelineEventType[T]) => void,
  ) => void;
};
