import { useCallback, useEffect, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Property from "..";

import EditPanel from "./EditPanel";

export type TimelineFieldProp = {
  currentTime: string;
  startTime: string;
  endTime: string;
};

export type Props = {
  name?: string;
  description?: string;
  value?: TimelineFieldProp;
  onChange?: (value?: TimelineFieldProp) => void;
};

const TimelineField: React.FC<Props> = ({ name, description, value, onChange }) => {
  const [openModal, setOpenModal] = useState(false);
  const t = useT();

  const handleTimelineModalClose = useCallback(() => setOpenModal(false), []);

  const handleTimelineModalOpen = useCallback(() => setOpenModal(true), []);

  const [timelineValues, setTimelineValues] = useState(value);

  const handleRemoveSetting = useCallback(() => {
    if (!value) return;
    onChange?.();
  }, [value, onChange]);

  useEffect(() => {
    setTimelineValues(value);
  }, [value]);

  return (
    <Property name={name} description={description}>
      <Wrapper>
        <InputWrapper disabled={true}>
          <Input dataTimeSet={!!timelineValues}>
            <Timeline>
              <TextWrapper size="footnote" customColor>
                {timelineValues?.startTime ? timelineValues?.startTime : t("not set")}
              </TextWrapper>
              <TextWrapper size="footnote" customColor>
                {timelineValues?.currentTime ? timelineValues?.currentTime : t("not set")}
              </TextWrapper>
              <TextWrapper size="footnote" customColor>
                {timelineValues?.endTime ? timelineValues?.endTime : t("not set")}
              </TextWrapper>
            </Timeline>
            <DeleteIcon
              icon="bin"
              size={10}
              disabled={!timelineValues}
              onClick={handleRemoveSetting}
            />
          </Input>
          <TriggerButton
            buttonType="secondary"
            text={t("set")}
            icon="set"
            size="small"
            iconPosition="left"
            onClick={() => handleTimelineModalOpen()}
          />
        </InputWrapper>
      </Wrapper>
      {openModal && (
        <EditPanel
          timelineValues={timelineValues}
          onChange={onChange}
          onClose={handleTimelineModalClose}
          isVisible={openModal}
          setTimelineValues={setTimelineValues}
        />
      )}
    </Property>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 12px;
`;

const InputWrapper = styled.div<{ disabled?: boolean }>`
  display: flex;
  width: 100%;
  gap: 10px;
`;

const Input = styled.div<{ dataTimeSet?: boolean }>`
  gap: 14px;
  width: 100%;
  display: flex;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 4px;
  height: auto;
  align-items: center;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  color: ${({ theme }) => theme.content.strong};
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset;
  color: ${({ theme, dataTimeSet }) => (dataTimeSet ? theme.content.strong : theme.content.weak)};
`;

const Timeline = styled.div`
  padding-left: 26px;
  position: relative;
  width: 90%;
  &:before {
    position: absolute;
    content: "";
    width: 2px;
    background: ${({ theme }) => theme.outline.weak};
    top: 8px;
    bottom: 10px;
    left: 15px;
  }
  &:nth-of-type(2n) {
    &:before {
      display: none;
    }
  }
`;

const TextWrapper = styled(Text)`
  position: relative;
  margin: 5px 0;
  :before {
    position: absolute;
  }
  ::after {
    position: absolute;
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    top: 22%;
    left: -15px;
    background: ${({ theme }) => theme.content.main};
    border: 1px solid ${({ theme }) => theme.outline.main};
  }
  &:nth-of-type(2) {
    ::after {
      background: transparent;
      border: 1px solid ${({ theme }) => theme.outline.main};
    }
  }
`;

const TriggerButton = styled(Button)`
  margin: 0;
  height: 28px;
`;

const DeleteIcon = styled(Icon)<{ disabled?: boolean }>`
  width: 10%;
  ${({ disabled, theme }) =>
    disabled
      ? `color: ${theme.content.weaker};`
      : `:hover {
    cursor: pointer;
      }`}
`;

export default TimelineField;
