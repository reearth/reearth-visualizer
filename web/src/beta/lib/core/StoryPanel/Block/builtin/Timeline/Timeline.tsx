import { useCallback, useState } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

const Timeline: React.FC = () => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const playSpeedOptions = ["1 min/sec", "0.1 hr/sec", "0.5 hr/sec", "1 hr/sec"];
  const [selected, setSelected] = useState("1 min/sec");

  const handlePopOver = useCallback(() => setOpen(!open), [open]);

  const handleClick = useCallback(
    (value: string) => {
      setOpen(false);
      if (value !== selected) setSelected(value);
    },
    [selected],
  );

  return (
    <Wrapper>
      <TimelineControl>
        <StyledIcon>
          <Icon icon="timelineStoryBlock" size={16} />
        </StyledIcon>
        <PlayControl>
          <Icon icon="timelinePlayLeft" />
          <Icon icon="play" />
          <Icon icon="timelinePlayRight" />
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
              <SpeedOption
                size="footnote"
                key={key}
                onClick={() => {
                  setSelected(playSpeed);
                  handleClick(playSpeed);
                }}>
                {t(`${playSpeed}`)}
              </SpeedOption>
            ))}
          </PickerWrapper>
        </Popover.Provider>
        <CurrentTime>2023/10/18 00:00:00</CurrentTime>
      </TimelineControl>
      <TimelineSlider>
        <ScaleList>
          {[...Array(11)].map((_, index) => (
            <Scale key={index} />
          ))}
        </ScaleList>
        <IconWrapper>
          <Icon icon="slider" />
        </IconWrapper>
      </TimelineSlider>
    </Wrapper>
  );
};

export default Timeline;

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
  gap: 23px;
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

const InputWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

const ArrowIcon = styled(Icon)<{ open: boolean }>`
  position: absolute;
  right: 10px;
  top: 60%;
  transform: ${({ open }) => (open ? "translateY(-50%) scaleY(-1)" : "translateY(-50%)")};
  color: ${({ theme }) => theme.content.weaker};
`;

const Select = styled.div`
  font-size: 15px;
  line-height: 1;
  padding-right: 28px;
  width: 100%;
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
  gap: 4px;
  flex-direction: column;
  justify-content: space-between;
  z-index: 1;
`;

const SpeedOption = styled(Text)`
  padding: 4px 12px;
  &:hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;

const CurrentTime = styled.div`
  color: ${({ theme }) => theme.content.weaker};
  position: relative;
`;

const TimelineSlider = styled.div`
  background: #e0e0e0;
  height: 38px;
  width: 100%;
  border-radius: 0px 0 8px 8px;
  position: relative;
`;

const ScaleList = styled.div`
  width: 100%;
  display: flex;
  height: 38px;
  align-items: flex-end;
  justify-content: space-between;
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 4px;
  left: 16px;
`;

const Scale = styled.div`
  height: 6px;
  border-left: 1px solid ${({ theme }) => theme.content.weak};
  margin: 0 auto;
`;
