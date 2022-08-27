import { memo } from "react";

import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
// eslint-disable-next-line no-restricted-imports
import type { SceneProperty } from "@reearth/components/molecules/Visualizer";
import { useT } from "@reearth/i18n";
import { PublishTheme, styled, usePublishTheme } from "@reearth/theme";

import { BORDER_WIDTH, PADDING_HORIZONTAL, KNOB_SIZE } from "./constants";
import { useTimeline } from "./hooks";
import ScaleList from "./ScaleList";
import { Range, TimeEventHandler } from "./types";

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
  onClick?: TimeEventHandler;
  onDrag?: TimeEventHandler;
  onPlay?: (isPlaying: boolean) => void;
  onPlayReversed?: (isPlaying: boolean) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onSpeedChange?: (speed: number) => void;
  isOpened?: boolean;
  sceneProperty?: SceneProperty;
};

const Timeline: React.FC<Props> = memo(
  function TimelinePresenter({
    currentTime,
    range,
    speed,
    onClick,
    onDrag,
    onPlay,
    onPlayReversed,
    isOpened,
    onOpen,
    onClose,
    onSpeedChange: onSpeedChangeProps,
    sceneProperty,
  }) {
    const {
      startDate,
      scaleCount,
      hoursCount,
      gapHorizontal,
      scaleInterval,
      strongScaleHours,
      currentPosition,
      events,
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
    const publishedTheme = usePublishTheme(sceneProperty?.theme);
    const t = useT();

    return isOpened ? (
      <Container>
        <CloseButton publishedTheme={publishedTheme} onClick={onClose}>
          <Icon alt={t("Close timeline")} icon="cancel" size={16} />
        </CloseButton>
        <ToolBox>
          <li>
            <PlayButton
              publishedTheme={publishedTheme}
              isPlaying={isPlayingReversed}
              onClick={toggleIsPlayingReversed}>
              <Icon alt={t("Playback timeline")} icon="playLeft" size={16} />
            </PlayButton>
          </li>
          <li>
            <PlayButton
              isRight
              publishedTheme={publishedTheme}
              isPlaying={isPlaying}
              onClick={toggleIsPlaying}>
              <Icon alt={t("Play timeline")} icon="playRight" size={16} />
            </PlayButton>
          </li>
          <li>
            <InputRangeLabel>
              <InputRangeLabelText size="xs">{speed}X</InputRangeLabelText>
              <InputRange
                publishedTheme={publishedTheme}
                type="range"
                max={10000}
                min={1}
                value={speed}
                onChange={onSpeedChange}
              />
            </InputRangeLabel>
          </li>
        </ToolBox>
        <CurrentTime size="xs" weight="bold">
          {formattedCurrentTime}
        </CurrentTime>
        {/**
         * TODO: Support keyboard operation for accessibility
         * see: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/slider_role
         */}
        <ScaleBox role="slider" {...events}>
          <ScaleList
            start={startDate}
            scaleCount={scaleCount}
            hoursCount={hoursCount}
            gapHorizontal={gapHorizontal}
            scaleInterval={scaleInterval}
            strongScaleHours={strongScaleHours}
          />
          <IconWrapper
            data-testid="knob-icon"
            publishedTheme={publishedTheme}
            style={{
              left: currentPosition + PADDING_HORIZONTAL - KNOB_SIZE / 2,
            }}>
            <Icon icon="ellipse" alt={t("ellipse")} size={KNOB_SIZE} />
          </IconWrapper>
        </ScaleBox>
      </Container>
    ) : (
      <OpenButton onClick={onOpen}>
        <Icon alt={t("Open timeline")} icon="timeline" size={24} />
      </OpenButton>
    );
  },
  (prev, next) =>
    prev.range === next.range &&
    prev.currentTime === next.currentTime &&
    prev.isOpened === next.isOpened,
);

type StyledColorProps = {
  publishedTheme: PublishTheme | undefined;
};

const Container = styled.div`
  background: ${({ theme }) => theme.main.deepBg};
  width: 100%;
  display: flex;
  box-sizing: border-box;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const OpenButton = styled.button`
  background: ${({ theme }) => theme.main.deepBg};
  color: ${({ theme }) => theme.main.text};
  padding: 8px 12px;
`;

const CloseButton = styled.button<StyledColorProps>`
  background: ${({ theme, publishedTheme }) => publishedTheme?.select || theme.main.select};
  padding: 4px;
  color: ${({ theme }) => theme.main.text};
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
`;

const PlayButton = styled.button<{ isRight?: boolean; isPlaying?: boolean } & StyledColorProps>`
  border-radius: 50%;
  width: 24px;
  height: 24px;
  border: ${({ theme }) => `1px solid ${theme.main.weak}`};
  color: ${({ theme }) => theme.main.text};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: ${({ isRight, theme }) => (isRight ? `${theme.metrics.s}px` : 0)};
  background: ${({ isPlaying, publishedTheme, theme }) =>
    isPlaying ? publishedTheme?.select || theme.main.select : "transparent"};
`;

const InputRangeLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${({ theme }) => `0 ${theme.metrics.s}px 0 ${theme.metrics.m}px`};
`;

const InputRangeLabelText = styled(Text)`
  color: ${({ theme }) => theme.main.text};
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
`;

const CurrentTime = styled(Text)`
  border: ${({ theme }) => `1px solid ${theme.main.weak}`};
  border-radius: 5px;
  color: ${({ theme }) => theme.main.text};
  padding: ${({ theme }) => `0 ${theme.metrics.s}px`};
  margin: ${({ theme }) => `${theme.metrics.s}px 0`};
`;

const ScaleBox = styled.div`
  border: ${({ theme }) => `${BORDER_WIDTH}px solid ${theme.colors.publish.dark.icon.weak}`};
  border-radius: 5px;
  box-sizing: border-box;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  ::-webkit-scrollbar {
    height: 5px;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: ${({ theme }) => theme.colors.publish.dark.icon.main};
  }
  margin: ${({ theme }) =>
    `${theme.metrics.s}px ${theme.metrics.m}px ${theme.metrics.s}px ${theme.metrics.xs}px`};
`;

const IconWrapper = styled.div<StyledColorProps>`
  position: absolute;
  top: 2px;
  color: ${({ theme, publishedTheme }) => publishedTheme?.select || theme.main.select};
`;

export default Timeline;
