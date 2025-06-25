import {
  Button,
  Popup,
  RangeSliderProps,
  TextInput
} from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import EditPanel from "./EditPanel";

export type ZoomLevelFieldProps = CommonFieldProps & RangeSliderProps;
const ZoomLevelField: FC<ZoomLevelFieldProps> = ({
  description,
  value,
  disabled,
  title,
  onChange,
  ...props
}) => {
  const theme = useTheme();
  const t = useT();

  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleDelete = useCallback(() => {
    onChange?.([null, null] as unknown as number[]);
  }, [onChange]);

  return (
    <CommonField title={title}>
      <InputWrapper>
        <TextInput
          value={
            value?.every((v) => v !== null) ? `${value[0]}-${value[1]}` : ""
          }
          placeholder={t("Not set")}
          appearance="readonly"
          disabled
          actions={[
            <Button
              key="delete"
              icon="trash"
              size="small"
              iconButton
              appearance="simple"
              disabled={!value || value.some((v) => v === null)}
              onClick={handleDelete}
              iconColor={
                value && value.some((v) => v !== null)
                  ? theme.content.main
                  : theme.content.weak
              }
            />
          ]}
        />

        <Popup
          trigger={
            <Button
              appearance="secondary"
              title={t("Edit")}
              icon="pencilSimple"
              size="small"
              onClick={handleOpen}
              disabled={disabled}
            />
          }
          open={open}
          offset={4}
          placement="bottom-start"
        >
          {open && (
            <EditPanel
              value={value}
              description={description}
              onClose={handleClose}
              onSave={onChange}
              {...props}
            />
          )}
        </Popup>
      </InputWrapper>
    </CommonField>
  );
};

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  flexWrap: "wrap",
  width: "100%"
}));

export default ZoomLevelField;
