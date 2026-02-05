import { Button, Popup, TextInput } from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { isValidDateTimeFormat } from "@reearth/app/utils/time";
import { useT } from "@reearth/services/i18n/hooks";
import { styled, useTheme } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback, useEffect, useState } from "react";

import EditPanel from "./EditPanel";

export type TimePointFieldProps = CommonFieldProps & {
  value?: string;
  disabled?: boolean;
  onChange?: (value?: string | undefined) => void;
  onEditorOpen?: () => void;
};

export type TimePointFieldRef = {
  closeEditor: () => void;
};

const TimePointField: FC<TimePointFieldProps> = ({
  title,
  description,
  value,
  onChange
}) => {
  const [open, setOpen] = useState(false);
  const t = useT();
  const theme = useTheme();

  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleTimeSettingDelete = useCallback(() => {
    setLocalValue("");
    if (!value) return;
    onChange?.();
  }, [value, onChange]);

  const handleInputBlur = useCallback(
    (timeString: string) => {
      if (timeString === value) return;
      // TODO: validate timeString
      if (timeString && isValidDateTimeFormat(timeString)) {
        onChange?.(timeString);
      }
    },
    [value, onChange]
  );

  return (
    <CommonField
      title={title}
      description={description}
      data-testid="time-point-field"
    >
      <Wrapper data-testid="time-point-wrapper">
        <TextInput
          value={localValue}
          onBlur={handleInputBlur}
          data-testid="time-point-text-input"
          actions={[
            <Button
              key="delete"
              icon="trash"
              size="small"
              iconButton
              appearance="simple"
              disabled={!localValue}
              onClick={handleTimeSettingDelete}
              iconColor={localValue ? theme.content.main : theme.content.weak}
              data-testid="time-point-delete-button"
            />
          ]}
          placeholder={"YYYY-MM-DDThh:mm:ss±hh:mm"}
        />
        <Popup
          trigger={
            <Button
              appearance="secondary"
              title={t("set")}
              icon="clock"
              size="small"
              onClick={() => setOpen(true)}
              data-testid="time-point-set-button"
            />
          }
          open={open}
          offset={8}
          placement="bottom-end"
          data-testid="time-point-popup"
        >
          {open && (
            <EditPanel
              value={localValue}
              onChange={onChange}
              onClose={() => setOpen(false)}
            />
          )}
        </Popup>
      </Wrapper>
    </CommonField>
  );
};

export default TimePointField;

const Wrapper = styled("div")(({ theme }) => ({
  display: css.display.flex,
  width: "100%",
  gap: theme.spacing.small,
  flexWrap: "wrap"
}));
