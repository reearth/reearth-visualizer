import { useCallback, useMemo, useState } from "react";

import type { CommonProps as BlockProps } from "@reearth//beta/lib/core/StoryPanel/Block/types";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import BlockWrapper from "@reearth/beta/lib/core/StoryPanel/Block/builtin/common/Wrapper";
import { getFieldValue } from "@reearth/beta/lib/core/StoryPanel/utils";
import type { ValueTypes } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

const TimelineBlock: React.FC<BlockProps> = ({ block, isSelected, ...props }) => {
  const src = useMemo(
    () => getFieldValue(block?.property?.items ?? [], "src") as ValueTypes["string"],
    [block?.property?.items],
  );
  console.log(src);
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
    <BlockWrapper
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
      {...props}>
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
          <div> mmm</div>
        </TimelineControl>
      </Wrapper>
    </BlockWrapper>
  );
};

export default TimelineBlock;

const Wrapper = styled.div`
  color: ${({ theme }) => theme.content.weaker};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.bg[3]};
  width: 100%;
`;

const TimelineControl = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 22px;
  gap: 30px;
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
  cursor: "pointer";
`;

const ArrowIcon = styled(Icon)<{ open: boolean }>`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: ${({ open }) => (open ? "translateY(-50%) scaleY(-1)" : "translateY(-50%)")};
  color: ${({ theme }) => theme.content.weaker};
`;

const Select = styled.div`
  padding: 7px 8px;
  font-size: 14px;
  line-height: 1;
  padding-right: 28px;
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
