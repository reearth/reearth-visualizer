import { Button, Popup, TextInput } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useEffect, useState } from "react";

import CommonField, { CommonFieldProps } from "../CommonField";

import EditPanel from "./EditPanel";

export type TimePointFieldProps = CommonFieldProps & {
  value?: string;
  disabledField?: boolean;
  fieldName?: string;
  onChange?: (value?: string | undefined) => void;
  onTimePointPopupOpen?: (fieldId?: string) => void;
  setDisabledFields?: (value: string[]) => void;
};

const TimePointField: FC<TimePointFieldProps> = ({
  commonTitle,
  description,
  value,
  disabledField,
  fieldName,
  onChange,
  onTimePointPopupOpen,
  setDisabledFields,
}) => {
  const [open, setOpen] = useState(false);
  const t = useT();
  const theme = useTheme();

  const handlePopOver = useCallback(() => {
    if (disabledField) {
      setOpen(false);
    } else {
      onTimePointPopupOpen?.(fieldName);
      setOpen(!open);
    }
    if (open) setDisabledFields?.([]);
  }, [disabledField, open, onTimePointPopupOpen, setDisabledFields, fieldName]);

  const handleTimeSettingDelete = useCallback(() => {
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
      <Wrapper>
        <TextInput
          appearance="readonly"
          value={value && dateTime}
          actions={[
            <Button
              key="delete"
              icon="trash"
              size="small"
              iconButton
              appearance="simple"
              disabled={!dateTime}
              onClick={handleTimeSettingDelete}
              iconColor={dateTime ? theme.content.main : theme.content.weak}
            />,
          ]}
          disabled
          placeholder={"YYYY-MM-DDThh:mm:ss±hh:mm"}
        />
        <Popup
          trigger={
            <Button
              appearance="secondary"
              title={t("set")}
              icon="clock"
              size="small"
              onClick={handlePopOver}
            />
          }
          open={open}
          offset={8}
          placement="bottom-end"
        >
          {open && (
            <EditPanel
              setDateTime={setDateTime}
              value={dateTime}
              onChange={onChange}
              onClose={handlePopOver}
            />
          )}
        </Popup>
      </Wrapper>
    </CommonField>
  );
};

export default TimePointField;

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  width: "100%",
  gap: theme.spacing.small,
  flexWrap: "wrap",
}));
