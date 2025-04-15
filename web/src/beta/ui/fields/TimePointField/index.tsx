import { Button, Popup, TextInput } from "@reearth/beta/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/beta/ui/fields/CommonField";
import { isValidDateTimeFormat } from "@reearth/beta/utils/time";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
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
    <CommonField title={title} description={description}>
      <Wrapper>
        <TextInput
          value={localValue}
          onBlur={handleInputBlur}
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
            />
          }
          open={open}
          offset={8}
          placement="bottom-end"
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
  display: "flex",
  width: "100%",
  gap: theme.spacing.small,
  flexWrap: "wrap"
}));
