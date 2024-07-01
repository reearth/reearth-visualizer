import { useCallback, useEffect, useState } from "react";

import EditPanel from "@reearth/beta/components/fields/DateTimeField/EditPanel";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { Button } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import CommonField, { CommonFieldProps } from "./CommonField";

export type TimeFieldProps = CommonFieldProps & {
  value?: string;
  disableField?: boolean;
  fieldName?: string;
  onChange?: (value?: string | undefined) => void;
  onPopoverOpen?: (fieldId?: string) => void;
  setDisabledFields?: (value: string[]) => void;
};

const TimeField: React.FC<TimeFieldProps> = ({
  commonTitle,
  description,
  value,
  disableField,
  fieldName,
  onChange,
  onPopoverOpen,
  setDisabledFields,
}) => {
  const [open, setOpen] = useState(false);
  const t = useT();

  const handlePopOver = useCallback(() => {
    if (disableField) {
      setOpen(false);
    } else {
      onPopoverOpen?.(fieldName);
      setOpen(!open);
    }
    if (open) setDisabledFields?.([]);
  }, [disableField, open, onPopoverOpen, setDisabledFields, fieldName]);

  const handleRemoveSetting = useCallback(() => {
    if (!value) return;
    setDateTime("");
    onChange?.();
  }, [value, onChange]);

  const [dateTime, setDateTime] = useState(value);

  useEffect(() => {
    setDateTime(value);
  }, [value]);

  return (
    <CommonField commonTitle={commonTitle} description={description}>
      <Popover.Provider open={!!open} placement="bottom">
        <Popover.Trigger asChild>
          <InputWrapper disabled={true}>
            <Input dataTimeSet={!!dateTime}>
              <StyledText size="footnote" customColor>
                {dateTime ? dateTime : "YYYY-MM-DDThh:mm:ss±hh:mm"}
              </StyledText>
              <DeleteIcon icon="bin" size={10} disabled={!dateTime} onClick={handleRemoveSetting} />
            </Input>
            <TriggerButton
              appearance="secondary"
              title={t("set")}
              icon="clock"
              size="small"
              onClick={() => handlePopOver()}
            />
          </InputWrapper>
        </Popover.Trigger>
        <Popover.Content autoFocus={false} attachToRoot>
          {open && (
            <EditPanel
              setDateTime={setDateTime}
              value={dateTime}
              onChange={onChange}
              onClose={handlePopOver}
            />
          )}
        </Popover.Content>
      </Popover.Provider>
    </CommonField>
  );
};

export default TimeField;

const InputWrapper = styled.div<{ disabled?: boolean }>`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
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
  box-shadow: ${({ theme }) => theme.shadow.input};
  width: 65%;
  color: ${({ theme, dataTimeSet }) => (dataTimeSet ? theme.content.strong : theme.content.weak)};
`;

const StyledText = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  padding: 4px 0;
`;

const TriggerButton = styled(Button)`
  margin-left: 10px;
`;

const DeleteIcon = styled(Icon)<{ disabled?: boolean }>`
  ${({ disabled, theme }) =>
    disabled
      ? `color: ${theme.content.weaker};`
      : `:hover {
    cursor: pointer;
      }`}
`;
