import { memo } from "react";

import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { styled, PublishTheme } from "@reearth/theme";

import { BORDER_WIDTH, PADDING_HORIZONTAL, KNOB_SIZE } from "./constants";
import { useTimeline } from "./hooks";
import ScaleList, { StyledColorProps } from "./ScaleList";
import { Range, TimeEventHandler } from "./types";

export type { Range, TimeEventHandler } from "./types";

export type Props = {
  /**
   * @description
   * This value need to be epoch time.
   */
  currentTime: number;
  /**
   * @description
   * These value need to be epoch time.
   */
  range?: { [K in keyof Range]?: Range[K] };
  speed?: number;
  isOpened?: boolean;
  theme?: PublishTheme;
  onClick?: TimeEventHandler;
  onDrag?: TimeEventHandler;
  onPlay?: (isPlaying: boolean) => void;
  onPlayReversed?: (isPlaying: boolean) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onSpeedChange?: (speed: number) => void;
};

const Timeline: React.FC<Props> = memo(function TimelinePresenter({
  currentTime,
  range,
  speed,
  isOpened,
  theme,
  onClick,
  onDrag,
  onPlay,
  onPlayReversed,
  onOpen,
  onClose,
  onSpeedChange: onSpeedChangeProps,
}) {
  const {
    startDate,
    scaleCount,
    hoursCount,
    gapHorizontal,
    scaleInterval,
    strongScaleMinutes,
    currentPosition,
    scaleElement,
    events,
    shouldScroll,
    player: {
      formattedCurrentTime,
      isPlaying,
      isPlayingReversed,
      toggleIsPlaying,
      toggleIsPlayingReversed,
      onSpeedChange,
    },
  } = useTimeline({
    currentTime,
    range,
    onClick,
    onDrag,
    onPlay,
    onPlayReversed,
    onSpeedChange: onSpeedChangeProps,
  });
  const t = useT();

  return isOpened ? (
    <Container publishedTheme={theme}>
      <div style={{ width: "32px" }}>
        <CloseButton publishedTheme={theme} onClick={onClose}>
          <Icon alt={t("Close timeline")} icon="cancel" size={16} />
        </CloseButton>
      </div>
      <ToolBox>
        <li>
          <PlayButton
            publishedTheme={theme}
            isPlaying={isPlayingReversed}
            onClick={toggleIsPlayingReversed}>
            <Icon alt={t("Playback timeline")} icon="playLeft" size={16} />
          </PlayButton>
        </li>
        <li>
          <PlayButton
            isRight
            publishedTheme={theme}
            isPlaying={isPlaying}
            onClick={toggleIsPlaying}>
            <Icon alt={t("Play timeline")} icon="playRight" size={16} />
          </PlayButton>
        </li>
        <li>
          <InputRangeLabel>
            <InputRangeLabelText size="xs" customColor publishedTheme={theme}>
              X{speed}
            </InputRangeLabelText>
            <InputRange
              publishedTheme={theme}
              type="range"
              max={10000}
              min={1}
              value={speed}
              onChange={onSpeedChange}
            />
          </InputRangeLabel>
        </li>
      </ToolBox>
      <CurrentTimeWrapper>
        <CurrentTime size="xs" customColor publishedTheme={theme}>
          {formattedCurrentTime.date}
        </CurrentTime>
        <CurrentTime size="xs" customColor publishedTheme={theme}>
          {formattedCurrentTime.time}
        </CurrentTime>
      </CurrentTimeWrapper>
      {/**
       * TODO: Support keyboard operation for accessibility
       * see: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/slider_role
       */}
      <ScaleBox role="slider" {...events} ref={scaleElement} shouldScroll={shouldScroll}>
        <ScaleList
          start={startDate}
          scaleCount={scaleCount}
          hoursCount={hoursCount}
          gapHorizontal={gapHorizontal}
          scaleInterval={scaleInterval}
          strongScaleMinutes={strongScaleMinutes}
          publishedTheme={theme}
        />
        <IconWrapper
          data-testid="knob-icon"
          publishedTheme={theme}
          style={{
            left: currentPosition + PADDING_HORIZONTAL - KNOB_SIZE / 2,
          }}>
          <Icon icon="ellipse" alt={t("ellipse")} size={KNOB_SIZE} />
        </IconWrapper>
      </ScaleBox>
    </Container>
  ) : (
    <OpenButton publishedTheme={theme} onClick={onOpen}>
      <Icon alt={t("Open timeline")} icon="timeline" size={24} />
    </OpenButton>
  );
});

const Container = styled.div<StyledColorProps>`
  background: ${({ theme, publishedTheme }) => publishedTheme?.background || theme.main.deepBg};
  width: 100%;
  height: 40px;
  display: flex;
  box-sizing: border-box;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const OpenButton = styled.button<StyledColorProps>`
  background: ${({ theme, publishedTheme }) => publishedTheme?.background || theme.main.deepBg};
  color: ${({ theme, publishedTheme }) => publishedTheme?.mainText || theme.main.text};
  padding: 8px 12px;
`;

const CloseButton = styled.button<StyledColorProps>`
  background: ${({ theme, publishedTheme }) => publishedTheme?.select || theme.main.select};
  color: ${({ theme, publishedTheme }) => publishedTheme?.mainText || theme.main.text};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const ToolBox = styled.ul`
  display: flex;
  align-items: center;
  margin: ${({ theme }) =>
    `${theme.metrics.s}px ${theme.metrics.s}px ${theme.metrics.s}px ${theme.metrics.l}px`};
  list-style: none;
  padding: 0;

  @media (max-width: 768px) {
    margin-left: ${({ theme }) => `${theme.metrics.s}px`};
  }
`;

const PlayButton = styled.button<{ isRight?: boolean; isPlaying?: boolean } & StyledColorProps>`
  border-radius: 50%;
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme, isPlaying, publishedTheme }) =>
    isPlaying ? publishedTheme?.select : publishedTheme?.mainText || theme.main.text};
  width: 22px;
  height: 22px;
  color: ${({ theme, publishedTheme }) => publishedTheme?.mainText || theme.main.text};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: ${({ isRight, theme }) => (isRight ? `${theme.metrics.s}px` : 0)};
  background: ${({ isPlaying, publishedTheme, theme }) =>
    isPlaying ? publishedTheme?.select || theme.main.select : "transparent"};

  @media (max-width: 768px) {
    margin-left: ${({ isRight, theme }) => (isRight ? `${theme.metrics.xs}px` : 0)};
  }
`;

const InputRangeLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: ${({ theme }) => theme.metrics["2xs"]}px;
`;

const InputRangeLabelText = styled(Text)<StyledColorProps>`
  color: ${({ theme, publishedTheme }) => publishedTheme?.mainText || theme.main.text};
  /* space for preventing layout shift by increasing speed label. */
  width: 37px;
  text-align: right;
  margin-right: ${({ theme }) => theme.metrics.s}px;
`;

const InputRange = styled.input<StyledColorProps>`
  -webkit-appearance: none;
  background: ${({ theme }) => theme.main.weak};
  height: 1px;
  width: 100px;
  border: none;
  ::-webkit-slider-thumb {
    -webkit-appearance: none;
    background: ${({ theme, publishedTheme }) => publishedTheme?.select || theme.main.select};
    height: 10px;
    width: 10px;
    border-radius: 50%;
  }

  @media (max-width: 768px) {
    width: 74px;
  }
`;

const CurrentTimeWrapper = styled.div`
  border: ${({ theme }) => `1px solid ${theme.main.weak}`};
  border-radius: 4px;
  padding: ${({ theme }) => `0 ${theme.metrics.s}px`};
  margin: ${({ theme }) => `${theme.metrics.xs}px 0`};
  flex-shrink: 0;
  width: 70px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const CurrentTime = styled(Text)<StyledColorProps>`
  color: ${({ theme, publishedTheme }) => publishedTheme?.mainText || theme.main.text};
  line-height: 16px;
  white-space: pre-line;
`;

const ScaleBox = styled.div<{ shouldScroll: boolean }>`
  border: ${({ theme }) => `${BORDER_WIDTH}px solid ${theme.main.weak}`};
  border-radius: 5px;
  box-sizing: border-box;
  position: relative;
  overflow-x: ${({ shouldScroll }) => (shouldScroll ? "overlay" : "hidden")};
  overflow-y: hidden;
  contain: strict;
  width: 100%;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  transition: -webkit-scrollbar 1s;
  ::-webkit-scrollbar {
    display: none;
  }
  :hover::-webkit-scrollbar {
    display: block;
    height: 2px;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
    background-color: red;
    display: none;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: ${({ theme }) => theme.colors.publish.dark.icon.main};
  }
  margin: ${({ theme }) =>
    `${theme.metrics.xs}px ${theme.metrics.s}px ${theme.metrics.xs}px ${theme.metrics.xs}px`};

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const IconWrapper = styled.div<StyledColorProps>`
  position: absolute;
  top: 2px;
  color: ${({ theme, publishedTheme }) => publishedTheme?.select || theme.main.select};
`;

export default Timeline;
