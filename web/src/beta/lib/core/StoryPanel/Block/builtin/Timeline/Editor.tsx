import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import useHooks from "@reearth/beta/lib/core/StoryPanel/Block/builtin/Timeline/hook";
import useTimelineBlock from "@reearth/beta/lib/core/StoryPanel/hooks/useTimelineBlock";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { TimelineValues } from ".";

type TimelineProps = {
  blockId?: string;
  isSelected?: boolean;
  timelineValues?: TimelineValues;
  inEditor?: boolean;
  playMode?: string;
};

const TimelineEditor = ({
  blockId,
  isSelected,
  timelineValues,
  inEditor,
  playMode,
}: TimelineProps) => {
  const t = useT();

  const {
    currentTime,
    range,
    playSpeedOptions,
    speed,
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
    <Wrapper>
      <TimelineControl>
        <StyledIcon activeBlock={isActive}>
          <Icon icon="timelineStoryBlockSolid" size={16} />
        </StyledIcon>
        <PlayControl>
          <PlayButton
            isClicked={true}
            isPlaying={isPlayingReversed}
            onClick={toggleIsPlayingReversed}>
            <Icon icon="timelinePlayLeft" />
          </PlayButton>
          <PlayButton
            isPlaying={isPause}
            isClicked={isPlaying || isPlayingReversed || isPause}
            onClick={() => {
              if (isPlaying || isPlayingReversed || isPause) {
                toggleIsPause();
              }
            }}>
            <Icon icon="pause" />
          </PlayButton>
          <PlayButton isClicked={true} isPlaying={isPlaying} onClick={toggleIsPlaying}>
            <Icon icon="timelinePlayRight" />
          </PlayButton>
        </PlayControl>
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
        <CurrentTime>{currentTime && formattedCurrentTime}</CurrentTime>
      </TimelineControl>
      <TimelineSlider>
        <ScaleList
          onClick={handleOnClick}
          onMouseMove={handleOnMouseMove}
          onMouseUp={handleOnEndMove}>
          {[...Array(11)].map((_, idx) => (
            <Scale key={idx}>
              {idx === 0 ? (
                <>
                  <ScaleLabel>{timeRange?.startTime?.date}</ScaleLabel>
                  <ScaleLabel>{timeRange?.startTime?.time}</ScaleLabel>
                </>
              ) : idx === 5 ? (
                <>
                  <ScaleLabel>{timeRange?.midTime?.date}</ScaleLabel>
                  <ScaleLabel>{timeRange?.midTime?.time}</ScaleLabel>
                </>
              ) : idx === 10 ? (
                <>
                  <ScaleLabel>{timeRange?.endTime?.date}</ScaleLabel>
                  <ScaleLabel>{timeRange?.endTime?.time}</ScaleLabel>
                </>
              ) : null}
            </Scale>
          ))}
        </ScaleList>
        <IconWrapper
          onMouseDown={handleOnStartMove}
          isPlaying={isPlaying || isPlayingReversed || isPause}
          style={{
            left: `${sliderPosition}px`,
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

const TimelineControl = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 6px;
  gap: 16px;
`;

const StyledIcon = styled.div<{ activeBlock: boolean }>`
  color: ${({ theme }) => theme.content.strong};
  cursor: pointer;
  background: ${({ activeBlock, theme }) => (activeBlock ? theme.select.main : theme.bg[4])};
  padding: 4px 6px 2px;
  border-radius: 6px 0 8px 0;
`;
const PlayControl = styled.div`
  display: flex;
  gap: 10px;
`;

const PlayButton = styled.div<{ isPlaying?: boolean; isClicked?: boolean }>`
  color: ${({ isPlaying, theme }) => (isPlaying ? theme.select.main : "")};
  cursor: ${({ isClicked }) => (isClicked ? "pointer" : "not-allowed")};
  pointer-events: ${({ isClicked }) => (isClicked ? "auto" : "")};
`;

const InputWrapper = styled.div`
  position: relative;
  cursor: pointer;
  width: 90px;
`;

const ArrowIcon = styled(Icon)<{ open: boolean }>`
  position: absolute;
  right: 10px;
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

const CurrentTime = styled.div`
  color: ${({ theme }) => theme.content.weaker};
  position: relative;
  font-size: 13px;
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

const ScaleLabel = styled.div`
  font-size: 10px;
  position: relative;
  bottom: 28px;
  right: 15px;
`;
