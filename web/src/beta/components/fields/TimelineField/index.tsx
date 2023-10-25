import { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Property from "..";

import EditPanel from "./EditPanel";

export type Props = {
  name?: string;
  description?: string;
  value?: string;
  onChange?: (value?: string | undefined) => void;
};

const TimelineField: React.FC<Props> = ({ name, description, value, onChange }) => {
  const [openModal, setOpenModal] = useState(false);
  const t = useT();

  const handleTimelineModalCloser = useCallback(() => setOpenModal(false), []);

  const handleTimelineModalOpener = useCallback(() => setOpenModal(true), []);

  const handleRemoveSetting = useCallback(() => {
    if (!value) return;
    onChange?.();
  }, [value, onChange]);

  return (
    <Property name={name} description={description}>
      <Wrapper>
        <InputWrapper disabled={true}>
          <Input dataTimeSet={!!value}>
            <Timeline>
              <TextWrapper size="footnote" customColor>
                {value ? value : t("not set")}
              </TextWrapper>
              <TextWrapper size="footnote" customColor>
                {value ? value : t("2023-10-24T00:00:00+09:00")}
              </TextWrapper>
              <TextWrapper size="footnote" customColor>
                {value ? value : t("2023-10-24T00:00:00+09:00")}
              </TextWrapper>
            </Timeline>
            <DeleteIcon icon="bin" size={10} disabled={!value} onClick={handleRemoveSetting} />
          </Input>
          <TriggerButton
            buttonType="secondary"
            text={t("set")}
            icon="clock"
            size="small"
            iconPosition="left"
            onClick={() => handleTimelineModalOpener()}
          />
        </InputWrapper>
      </Wrapper>
      {openModal && <EditPanel onClose={handleTimelineModalCloser} isVisible={openModal} />}
    </Property>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InputWrapper = styled.div<{ disabled?: boolean }>`
  display: flex;
  width: 100%;
  gap: 10px;
`;

const Input = styled.div<{ dataTimeSet?: boolean }>`
  gap: 14px;
  flex: 1;
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
  &:before {
    position: absolute;
    content: "";
    width: 2px;
    background: ${({ theme }) => theme.outline.weak};
    top: 8px;
    bottom: 10px;
    left: 15px;
  }
  &:nth-child(2) {
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
  &:nth-child(2) {
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
  ${({ disabled, theme }) =>
    disabled
      ? `color: ${theme.content.weaker};`
      : `:hover {
    cursor: pointer;
      }`}
`;

export default TimelineField;
