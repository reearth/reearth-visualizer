import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import useTimelineBlock from "@reearth/beta/lib/core/shared/hooks/useTimelineBlock";
import useHooks from "@reearth/beta/lib/core/StoryPanel/Block/builtin/Timeline/hook";
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
  property,
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
    onTimeChange,
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
    handleOnStartMove,
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
    timelineValues,
  });

  return (
    <Wrapper ref={blockRef}>
      <TimelineWrapper isMinimized={isMinimized}>
        <TimelineControl isMinimized={isMinimized}>
          <StyledIcon activeBlock={isActive}>
            <Icon icon="timelineStoryBlockSolid" size={16} />
          </StyledIcon>
          <PlayControl isMinimized={isMinimized}>
            <PlayButton
              isClicked={true}
              isPlaying={isPlayingReversed}
              onClick={toggleIsPlayingReversed}>
              <Icon icon="timelinePlayLeft" size={14} />
            </PlayButton>
            <PlayButton
              isPlaying={isPause}
              isClicked={isPlaying || isPlayingReversed || isPause}
              onClick={() => {
                if (isPlaying || isPlayingReversed || isPause) {
                  toggleIsPause();
                }
              }}>
              <Icon icon="pause" size={14} />
            </PlayButton>
            <PlayButton isClicked={true} isPlaying={isPlaying} onClick={toggleIsPlaying}>
              <Icon icon="timelinePlayRight" size={14} />
            </PlayButton>
          </PlayControl>
          <PopoverWrapper isMinimized={isMinimized}>
            <Popover.Provider open={isOpen} placement="bottom-start" onOpenChange={handlePopOver}>
              <Popover.Trigger asChild>
                <InputWrapper onClick={handlePopOver}>
                  <Select>{selected && t(`${selected}`)}</Select>
                  <ArrowIcon icon="arrowDown" open={isOpen} size={16} />
                </InputWrapper>
              </Popover.Trigger>
              <PickerWrapper attachToRoot>
                {playSpeedOptions?.map((playSpeed, key) => (
                  <InputOptions
                    key={key}
                    value={playSpeed.seconds}
                    onClick={() => {
                      handleOnSelect(playSpeed.timeString, playSpeed.seconds);
                    }}>
                    {playSpeed.timeString}
                  </InputOptions>
                ))}
              </PickerWrapper>
            </Popover.Provider>
          </PopoverWrapper>
        </TimelineControl>
        <CurrentTime isMinimized={isMinimized}>{!!currentTime && formattedCurrentTime}</CurrentTime>
      </TimelineWrapper>
      <TimelineSlider>
        <ScaleList
          onClick={handleOnClick}
          onMouseMove={handleOnMouseMove}
          onMouseUp={handleOnEndMove}>
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
          isPlaying={isPlaying || isPlayingReversed || isPause}
          style={{
            left: `${sliderPosition}%`,
          }}>
          <Icon icon="slider" />
        </IconWrapper>
      </TimelineSlider>
      <div />
    </Wrapper>
  );
};

export default TimelineEditor;

const Wrapper = styled.div`
  color: ${({ theme }) => theme.content.weaker};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.bg[3]};
  width: 100%;
  user-select: none;
`;

const TimelineWrapper = styled.div<{ isMinimized: boolean }>`
  display: flex;
  align-items: center;
  padding-bottom: 6px;
  gap: ${({ isMinimized }) => (isMinimized ? "" : "25px")};
  flex-direction: ${({ isMinimized }) => (isMinimized ? "column" : "row")};
`;

const TimelineControl = styled.div<{ isMinimized: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ isMinimized }) => (isMinimized ? "0" : "18px")};
  width: ${({ isMinimized }) => (isMinimized ? "100%" : "auto")};
`;

const StyledIcon = styled.div<{ activeBlock: boolean }>`
  color: ${({ theme }) => theme.content.strong};
  cursor: pointer;
  background: ${({ activeBlock, theme }) => (activeBlock ? theme.select.main : theme.bg[4])};
  padding: 4px 6px 2px;
  border-radius: 6px 0 8px 0;
  margin-bottom: 6px;
`;

const PlayControl = styled.div<{ isMinimized: boolean }>`
  display: flex;
  gap: 10px;
  margin-left: ${({ isMinimized }) => (isMinimized ? "auto" : "0")};
`;

const CurrentTime = styled.div<{ isMinimized: boolean }>`
  color: ${({ theme }) => theme.content.weaker};
  padding-right: ${({ isMinimized }) => (isMinimized ? "8px" : "0")};
  font-size: 12px;
  margin-left: ${({ isMinimized }) => (isMinimized ? "auto" : "0")};
`;

const PlayButton = styled.div<{ isPlaying?: boolean; isClicked?: boolean }>`
  color: ${({ isPlaying, theme }) => (isPlaying ? theme.select.main : "")};
  cursor: ${({ isClicked }) => (isClicked ? "pointer" : "not-allowed")};
  pointer-events: ${({ isClicked }) => (isClicked ? "auto" : "")};
`;

const InputWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

const ArrowIcon = styled(Icon)<{ open: boolean }>`
  position: absolute;
  right: -6px;
  top: 60%;
  transform: ${({ open }) => (open ? "translateY(-50%) scaleY(-1)" : "translateY(-50%)")};
  color: ${({ theme }) => theme.content.weaker};
`;

const Select = styled.div`
  font-size: 14px;
  line-height: 1;
  padding-right: 12px;
  color: ${({ theme }) => theme.content.weaker};
`;
const PopoverWrapper = styled.div<{ isMinimized: boolean }>`
  padding: ${({ isMinimized }) => (isMinimized ? "0 10px" : "0")};
`;

const PickerWrapper = styled(Popover.Content)`
  min-width: 100px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  outline: none;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg[3]};
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: ${({ theme }) => theme.zIndexes.visualizer.storyBlock};
`;

const InputOptions = styled.option`
  background: ${({ theme }) => theme.bg[1]};
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 12px;
  &:hover {
    background: ${({ theme }) => theme.bg[2]};
  }
  color: ${({ theme }) => theme.content.main};
`;

const TimelineSlider = styled.div`
  background: #e0e0e0;
  height: 38px;
  width: 100%;
  border-radius: 0px 0 8px 8px;
  position: relative;
  overflow: hidden;
`;

const ScaleList = styled.div`
  display: flex;
  height: 38px;
  align-items: flex-end;
  position: absolute;
  left: 18px;
  right: -12px;
  cursor: pointer;
`;

const IconWrapper = styled.div<{ isPlaying: boolean }>`
  position: absolute;
  top: 4px;
  cursor: pointer;
  color: ${({ isPlaying, theme }) => (isPlaying ? theme.select.main : "")};
`;

const Scale = styled.div`
  height: 5px;
  border-left: 1px solid ${({ theme }) => theme.content.weak};
  margin: 0 auto;
  flex: 1;
  text-align: center;
  width: calc(100% / 11);
`;

const ScaleLabel = styled.div<{ isMinimized: boolean }>`
  font-size: ${({ isMinimized }) => (isMinimized ? "8px" : "10px")};
  position: relative;
  bottom: 28px;
  right: 16px;
  width: 34px;
`;
