export declare type Timeline = {
  startTime?: Date;
  stopTime?: Date;
  currentTime?: Date;
  isPlaying?: boolean;
  speed?: number;
  stepType?: "rate" | "fixed";
  rangeType?: "unbounded" | "clamped" | "bounced";
  readonly tick?: () => Date | void;
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
};
