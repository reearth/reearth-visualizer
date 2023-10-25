import { useCallback, useContext, useState } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import { Timeline } from "@reearth/beta/lib/core/Map/useTimelineManager";
import useHooks from "@reearth/beta/lib/core/StoryPanel/Block/builtin/Timeline/hook";
import useTimelineBlock from "@reearth/beta/lib/core/StoryPanel/hooks/useTimelineBlock";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { BlockContext } from "../common/Wrapper";

type TimelineProps = {
  blockId?: string;
  isSelected?: boolean;
  timeValues?: Timeline;
  inEditor?: boolean;
};

const TimelineEditor = ({ blockId, isSelected, timeValues, inEditor }: TimelineProps) => {
  const t = useT();
  const [open, setOpen] = useState(false);

  const [selected, setSelected] = useState("1min/sec");

  const {
    currentTime,
    range,
    playSpeedOptions,
    onClick,
    onDrag,
    onPlay,
    onPlayReversed,
    onSpeedChange,
    onPause,
  } = useTimelineBlock(timeValues);

  const {
    formattedCurrentTime,
    timeRange,
    isPlaying,
    isPlayingReversed,
    isPause,
    currentPosition,
    toggleIsPlaying,
    toggleIsPlayingReversed,
    toggleIsPause,
  } = useHooks({
    currentTime,
    range,
    isSelected,
    blockId,
    onClick,
    onDrag,
    onPlay,
    onPlayReversed,
    onSpeedChange,
    onPause,
  });

  const context = useContext(BlockContext);
  const handlePopOver = useCallback(() => setOpen(!open), [open]);

  console.log(currentPosition);

  const handleClick = useCallback(
    (value: string, second: number) => {
      setOpen(false);
      if (value !== selected) setSelected(value);
      onSpeedChange(second);
    },
    [onSpeedChange, selected],
  );

  return (
    <Wrapper>
      {!context?.editMode && inEditor && <Overlay />}
      <TimelineControl>
        <StyledIcon>
          <Icon icon="timelineStoryBlock" size={16} />
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
        <Popover.Provider open={open} placement="bottom-start" onOpenChange={handlePopOver}>
          <Popover.Trigger asChild>
            <InputWrapper onClick={handlePopOver}>
              <Select>{selected && t(`${selected}`)}</Select>
              <ArrowIcon icon="arrowDown" open={open} size={16} />
            </InputWrapper>
          </Popover.Trigger>
          <PickerWrapper attachToRoot>
            {playSpeedOptions?.map((playSpeed, key) => (
              <InputOptions
                key={key}
                value={playSpeed.seconds}
                onClick={() => {
                  handleClick(playSpeed.timeString, playSpeed.seconds);
                }}>
                {playSpeed.timeString}
              </InputOptions>
            ))}
          </PickerWrapper>
        </Popover.Provider>
        <CurrentTime>{currentTime && formattedCurrentTime}</CurrentTime>
      </TimelineControl>
      <TimelineSlider>
        <ScaleList>
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
          style={{
            left: `${currentPosition.toFixed(3)}px`,
          }}>
          <Icon icon="slider" />
        </IconWrapper>
      </TimelineSlider>
    </Wrapper>
  );
};

export default TimelineEditor;

const Wrapper = styled.div`
  color: ${({ theme }) => theme.content.weaker};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.bg[3]};
  width: 100%;
`;

const TimelineControl = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 6px;
  gap: 22px;
`;

const StyledIcon = styled.div`
  color: ${({ theme }) => theme.content.strong};
  cursor: pointer;
  background: ${({ theme }) => theme.bg[4]};
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
  z-index: 2;
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
`;

const ScaleList = styled.div`
  width: 99%;
  display: flex;
  height: 38px;
  align-items: flex-end;
  padding-left: 17px;
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 4px;
`;

const Scale = styled.div`
  height: 5px;
  border-left: 1px solid ${({ theme }) => theme.content.weak};
  margin: 0 auto;
  flex: 1;
  text-align: center;
`;

const ScaleLabel = styled.div`
  font-size: 10px;
  position: relative;
  bottom: 28px;
  right: 15px;
`;

const Overlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;
