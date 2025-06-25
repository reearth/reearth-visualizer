import useHooks from "@reearth/app/features/Visualizer/Crust/StoryPanel/Block/builtin/Timeline/hook";
import useTimelineBlock from "@reearth/app/features/Visualizer/shared/hooks/useTimelineBlock";
import { Icon, Popup } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { TimelineValues } from ".";

export type PaddingProp = {
  bottom: number;
  top: number;
  left?: number;
  right?: number;
};

type TimelineProps = {
  blockId?: string;
  isSelected?: boolean;
  timelineValues?: TimelineValues;
  inEditor?: boolean;
  playMode?: string;
  padding?: PaddingProp;
  property?: any;
};

const TimelineEditor = ({
  blockId,
  isSelected,
  timelineValues,
  inEditor,
  playMode,
  padding,
  property
}: TimelineProps) => {
  const t = useT();
  const {
    currentTime,
    range,
    playSpeedOptions,
    speed,
    timezone,
    onPlay,
    onSpeedChange,
    onPause,
    onCommit,
    onTick,
    removeOnCommitEventListener,
    removeTickEventListener,
    setCurrentTime,
    onTimeChange
  } = useTimelineBlock(timelineValues);

  const {
    formattedCurrentTime,
    timeRange,
    isPause,
    isPlaying,
    isPlayingReversed,
    isOpen,
    selected,
    sliderPosition,
    isActive,
    blockRef,
    isMinimized,
    handleOnSelect,
    handlePopOver,
    toggleIsPlaying,
    toggleIsPlayingReversed,
    toggleIsPause,
    handleOnClick,
    handleOnMouseMove,
    handleOnEndMove,
    handleOnStartMove
  } = useHooks({
    currentTime,
    range,
    isSelected,
    blockId,
    inEditor,
    speed,
    playMode,
    padding,
    property,
    timezone,
    onPlay,
    onSpeedChange,
    onPause,
    onCommit,
    onTimeChange,
    onTick,
    removeOnCommitEventListener,
    removeTickEventListener,
    setCurrentTime,
    timelineValues
  });

  return (
    <Wrapper ref={blockRef}>
      <TimelineWrapper isMinimized={isMinimized}>
        <TimelineControl isMinimized={isMinimized}>
          <StyledIcon activeBlock={isActive}>
            <Icon icon="clockFilled" size="normal" />
          </StyledIcon>
          <PlayControl isMinimized={isMinimized}>
            <PlayButton
              isClicked={true}
              isPlaying={isPlayingReversed}
              onClick={toggleIsPlayingReversed}
            >
              <Icon icon="playLeftFilled" size={14} />
            </PlayButton>
            <PlayButton
              isPlaying={isPause}
              isClicked={isPlaying || isPlayingReversed || isPause}
              onClick={() => {
                if (isPlaying || isPlayingReversed || isPause) {
                  toggleIsPause();
                }
              }}
            >
              <Icon icon="pause" size={14} />
            </PlayButton>
            <PlayButton
              isClicked={true}
              isPlaying={isPlaying}
              onClick={toggleIsPlaying}
            >
              <Icon icon="playRightFilled" size={14} />
            </PlayButton>
          </PlayControl>
          <PopoverWrapper isMinimized={isMinimized}>
            <Popup
              offset={4}
              open={isOpen}
              placement="bottom-start"
              onOpenChange={handlePopOver}
              trigger={
                <InputWrapper onClick={handlePopOver}>
                  <Select>{selected && t(`${selected}`)}</Select>
                  <ArrowIcon icon="caretDown" open={isOpen} />
                </InputWrapper>
              }
            >
              <SelectorWrapper>
                {playSpeedOptions?.map((playSpeed, key) => (
                  <InputOptions
                    key={key}
                    value={playSpeed.seconds}
                    onClick={() => {
                      handleOnSelect(playSpeed.timeString, playSpeed.seconds);
                    }}
                  >
                    {playSpeed.timeString}
                  </InputOptions>
                ))}
              </SelectorWrapper>
            </Popup>
          </PopoverWrapper>
        </TimelineControl>
        <CurrentTime isMinimized={isMinimized}>
          {!!currentTime && formattedCurrentTime}
        </CurrentTime>
      </TimelineWrapper>
      <TimelineSlider>
        <ScaleList
          onClick={handleOnClick}
          onMouseMove={handleOnMouseMove}
          onMouseUp={handleOnEndMove}
        >
          {[...Array(11)].map((_, idx) => (
            <Scale key={idx}>
              {idx === 0 ? (
                <ScaleLabel isMinimized={isMinimized}>
                  {timeRange?.startTime?.date}
                  <br />
                  {timeRange?.startTime?.time}
                </ScaleLabel>
              ) : idx === 5 ? (
                <ScaleLabel isMinimized={isMinimized}>
                  {timeRange?.midTime?.date}
                  <br />
                  {timeRange?.midTime?.time}
                </ScaleLabel>
              ) : idx === 10 ? (
                <ScaleLabel isMinimized={isMinimized}>
                  {timeRange?.endTime?.date}
                  <br />
                  {timeRange?.endTime?.time}
                </ScaleLabel>
              ) : null}
            </Scale>
          ))}
        </ScaleList>
        <IconWrapper
          onMouseDown={handleOnStartMove}
          style={{
            left: `${sliderPosition}%`
          }}
        >
          <TimelineSliderIcon
            isPlaying={isPlaying || isPlayingReversed || isPause}
          />
        </IconWrapper>
      </TimelineSlider>
    </Wrapper>
  );
};

export default TimelineEditor;

const Wrapper = styled("div")(({ theme }) => ({
  width: "100%",
  color: theme.content.weaker,
  borderRadius: theme.radius.large,
  border: `1px solid ${theme.bg[3]}`,
  userSelect: "none"
}));

const TimelineWrapper = styled("div")<{ isMinimized: boolean }>(
  ({ isMinimized, theme }) => ({
    display: "flex",
    alignItems: "center",
    paddingBottom: theme.spacing.small - 2,
    gap: isMinimized ? "" : "25px",
    flexDirection: isMinimized ? "column" : "row"
  })
);

const TimelineControl = styled("div")<{ isMinimized: boolean }>(
  ({ isMinimized }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: isMinimized ? "0" : "18px",
    width: isMinimized ? "100%" : "auto"
  })
);

const StyledIcon = styled("div")<{ activeBlock: boolean }>(
  ({ activeBlock, theme }) => ({
    color: theme.content.strong,
    cursor: "pointer",
    background: activeBlock ? theme.select.main : theme.bg[4],
    padding: `${theme.spacing.smallest}px ${theme.spacing.small - 2}px ${theme.spacing.micro}px `,
    borderRadius: `${theme.radius.normal}px 0 ${theme.radius.large}px 0`,
    marginBottom: "6px"
  })
);

const PlayControl = styled("div")<{ isMinimized: boolean }>(
  ({ isMinimized, theme }) => ({
    display: "flex",
    gap: theme.spacing.small + 2,
    marginLeft: isMinimized ? "auto" : "0"
  })
);

const CurrentTime = styled("div")<{ isMinimized: boolean }>(
  ({ isMinimized, theme }) => ({
    color: theme.content.weaker,
    paddingRight: isMinimized ? "8px" : "0",
    fontSize: "12px",
    marginLeft: isMinimized ? "auto" : "0"
  })
);

const PlayButton = styled("div")<{ isPlaying?: boolean; isClicked?: boolean }>(
  ({ isPlaying, isClicked, theme }) => ({
    color: isPlaying ? theme.select.main : "",
    cursor: isClicked ? "pointer" : "not-allowed",
    pointerEvents: isClicked ? "auto" : "none"
  })
);

const InputWrapper = styled("div")({
  position: "relative",
  cursor: "pointer"
});

const ArrowIcon = styled(Icon)<{ open: boolean }>(({ open, theme }) => ({
  position: "absolute",
  right: "-6px",
  top: "60%",
  transform: open ? "translateY(-50%) scaleY(-1)" : "translateY(-50%)",
  color: theme.content.weaker
}));

const Select = styled("div")(({ theme }) => ({
  fontSize: "14px",
  lineHeight: 1,
  paddingRight: theme.spacing.normal,
  color: theme.content.weaker
}));

const PopoverWrapper = styled("div")<{ isMinimized: boolean }>(
  ({ isMinimized, theme }) => ({
    padding: isMinimized ? `0 ${theme.spacing.small + 2}px` : "0"
  })
);

const SelectorWrapper = styled("div")(({ theme }) => ({
  minWidth: "100px",
  border: `1px solid ${theme.outline.weak}`,
  outline: "none",
  borderRadius: theme.radius.small,
  background: theme.bg[3],
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  zIndex: theme.zIndexes.visualizer.storyBlock,
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.25)"
}));

const InputOptions = styled("option")(({ theme }) => ({
  background: theme.bg[1],
  border: "none",
  cursor: "pointer",
  padding: `${theme.spacing.smallest}px ${theme.spacing.small}px`,
  fontSize: " 12px",
  ["&:hover"]: {
    background: theme.bg[2]
  },
  color: theme.content.main
}));

const TimelineSlider = styled("div")(({ theme }) => ({
  background: "#e0e0e0",
  height: "38px",
  width: "100%",
  borderRadius: `0 0 ${theme.radius.large}px ${theme.radius.large}px`,
  position: "relative",
  overflow: "hidden"
}));

const TimelineSliderIcon = styled("div")<{ isPlaying: boolean }>(
  ({ isPlaying, theme }) => ({
    background: isPlaying ? theme.select.main : theme.bg[4],
    height: 30,
    width: 6,
    borderRadius: theme.radius.smallest
  })
);

const ScaleList = styled("div")({
  display: "flex",
  height: "38px",
  alignItems: "flex-end",
  position: "absolute",
  left: "18px",
  right: "-12px",
  cursor: "pointer"
});

const IconWrapper = styled("div")({
  position: "absolute",
  top: "4px",
  cursor: "pointer"
});

const Scale = styled("div")(({ theme }) => ({
  height: "5px",
  borderLeft: `1px solid ${theme.content.weak}`,
  margin: "0 auto",
  flex: 1,
  textalign: "center",
  width: "calc(100% / 11)"
}));

const ScaleLabel = styled("div")<{ isMinimized: boolean }>(
  ({ isMinimized }) => ({
    fontSize: isMinimized ? "8px" : "10px",
    position: "relative",
    bottom: "28px",
    right: "16px",
    width: "34px"
  })
);
