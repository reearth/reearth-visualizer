import { useCallback, useEffect, useState } from "react";

import EditPanel from "@reearth/beta/components/fields/DateTimeField/EditPanel";
import { Button, Typography, Icon, Popup } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

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
  const theme = useTheme();

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
      <Popup
        trigger={
          <InputWrapper disabled={true}>
            <Input dataTimeSet={!!dateTime}>
              <StyledText size="footnote" color={theme.content.main}>
                {dateTime ? dateTime : "YYYY-MM-DDThh:mm:ss±hh:mm"}
              </StyledText>
              <DeleteIconWrapper onClick={handleRemoveSetting} disabled={!dateTime}>
                <DeleteIcon icon="trash" size="small" />
              </DeleteIconWrapper>
            </Input>
            <TriggerButton
              appearance="secondary"
              title={t("set")}
              icon="clock"
              size="small"
              onClick={() => handlePopOver()}
            />
          </InputWrapper>
        }
        open={open}
        onOpenChange={isOpen => setOpen(isOpen)}
        placement="bottom-start">
        {open && (
          <EditPanel
            setDateTime={setDateTime}
            value={dateTime}
            onChange={onChange}
            onClose={handlePopOver}
          />
        )}
      </Popup>
    </CommonField>
  );
};

export default TimeField;

const InputWrapper = styled("div")<{ disabled?: boolean }>(({ theme, disabled }) => ({
  display: "flex",
  width: "100%",
  gap: theme.spacing.small,
  flexWrap: "wrap",
  opacity: disabled ? 0.6 : 1,
}));

const Input = styled("div")<{ dataTimeSet?: boolean }>(({ theme, dataTimeSet }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing.smallest,
  flex: 1,
  padding: "0 8px",
  borderRadius: "4px",
  border: `1px solid ${theme.outline.weak}`,
  background: theme.bg[1],
  boxShadow: theme.shadow.input,
  width: "197px",
  color: dataTimeSet ? theme.content.strong : theme.content.weak,
}));

const StyledText = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  padding: 4px 0;
`;

const TriggerButton = styled(Button)`
  margin-left: 10px;
`;

const DeleteIconWrapper = styled("div")<{ disabled?: boolean }>(({ disabled }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: disabled ? "not-allowed" : "pointer",
}));

const DeleteIcon = styled(Icon)``;
