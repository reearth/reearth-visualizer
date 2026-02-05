import {
  Button,
  IconButton,
  Popup,
  TextInput
} from "@reearth/app/lib/reearth-ui";
import CommonField, {
  CommonFieldProps
} from "@reearth/app/ui/fields/CommonField";
import { useT } from "@reearth/services/i18n";
import { useNotification } from "@reearth/services/state";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import EditPanel from "./EditPanel";

export type ResourceUrlProp = {
  value: string;
  onSubmit: (url: string) => void;
} & CommonFieldProps;
const ResourceUrl: FC<ResourceUrlProp> = ({ value, title, onSubmit }) => {
  const t = useT();
  const theme = useTheme();
  const [, setNotification] = useNotification();

  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleIconClick = useCallback(() => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setNotification({
      type: "success",
      text: t("Resource URL copied to clipboard")
    });
  }, [setNotification, t, value]);

  return (
    <CommonField title={title}>
      <InputWrapper>
        <TextInput
          value={value}
          appearance="readonly"
          disabled
          actions={[
            <IconButton
              icon="copy"
              size="small"
              appearance="simple"
              key="copy"
              iconColor={theme.content.weak}
              onClick={handleIconClick}
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
            />
          }
          open={open}
          offset={4}
          placement="bottom-start"
        >
          {open && <EditPanel onClose={handleClose} onSubmit={onSubmit} />}
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

export default ResourceUrl;
