import { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
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

const DateTimeField: React.FC<Props> = ({ name, description, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const t = useT();

  const handlePopOver = useCallback(() => setOpen(!open), [open]);
  const handleRemoveSetting = useCallback(() => {
    if (!value) return;
    onChange?.();
  }, [value, onChange]);

  return (
    <Property name={name} description={description}>
      <Wrapper>
        <Popover.Provider open={!!open} placement="bottom-start">
          <Popover.Trigger asChild>
            <InputWrapper disabled={true}>
              <Input dataTimeSet={!!value}>
                <Text size="footnote" customColor>
                  {value ? value : "YYYY-MM-DDThh:mm:ss±hh:mm"}
                </Text>
                <DeleteIcon icon="bin" size={10} disabled={!value} onClick={handleRemoveSetting} />
              </Input>
              <TriggerButton
                buttonType="secondary"
                text={t("set")}
                icon="clock"
                size="small"
                iconPosition="left"
                onClick={() => handlePopOver()}
              />
            </InputWrapper>
          </Popover.Trigger>
          <Popover.Content autoFocus={false}>
            {open && <EditPanel onChange={onChange} onClose={handlePopOver} />}
          </Popover.Content>
        </Popover.Provider>
      </Wrapper>
    </Property>
  );
};

export default DateTimeField;

const Wrapper = styled.div`
  display: flex;
  align-items: stretch;
  gap: 4px;
`;

const InputWrapper = styled.div<{ disabled?: boolean }>`
  display: flex;
  width: 100%;
  gap: 10px;
  height: 28px;
`;

const Input = styled.div<{ dataTimeSet?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  flex: 1;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.outline.weak};
  color: ${({ theme }) => theme.content.strong};
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.25) inset;

  color: ${({ theme, dataTimeSet }) => (dataTimeSet ? theme.content.strong : theme.content.weak)};
`;

const TriggerButton = styled(Button)`
  margin: 0;
`;

const DeleteIcon = styled(Icon)<{ disabled?: boolean }>`
  ${({ disabled, theme }) =>
    disabled
      ? `color: ${theme.content.weaker};`
      : `:hover {
    cursor: pointer;
      }`}
`;
