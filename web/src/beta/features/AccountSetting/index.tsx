import {
  Collapse,
  TextInput,
  Typography,
  IconButton
} from "@reearth/beta/lib/reearth-ui";
import { InputField } from "@reearth/beta/ui/fields";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useState } from "react";

import useHook from "./hooks";
import PasswordModal from "./PasswordModal";

const AccountSetting: FC = () => {
  const t = useT();
  const [changePasswordModal, setChangePasswordModal] =
    useState<boolean>(false);

  const { meData, passwordPolicy, handleUpdateUserPassword } = useHook();
  const { name, email } = meData;

  return (
    <InnerPage>
      <SettingsWrapper>
        <Collapse size="large" title={t("Account")}>
          <SettingsFields>
            <InputField
              title={t("Name")}
              value={name ? t(name) : ""}
              appearance="readonly"
              disabled
            />
            <InputField
              title={t("Email address")}
              value={email ? t(email) : ""}
              appearance="readonly"
              disabled
            />

            <PasswordWrapper>
              <Typography size="body">{t("Password")}</Typography>
              <PasswordInputWrapper>
                <TextInput
                  value={"**********"}
                  appearance="readonly"
                  disabled
                  extendWidth
                />
                <IconButton
                  appearance="secondary"
                  icon="pencilSimple"
                  onClick={() => {
                    setChangePasswordModal(true);
                  }}
                  size="medium"
                  hasBorder={true}
                />
              </PasswordInputWrapper>
            </PasswordWrapper>
          </SettingsFields>
        </Collapse>
      </SettingsWrapper>

      <PasswordModal
        isVisible={changePasswordModal}
        passwordPolicy={passwordPolicy}
        onClose={() => setChangePasswordModal(false)}
        handleUpdateUserPassword={handleUpdateUserPassword}
      />
    </InnerPage>
  );
};
export default AccountSetting;

const PasswordWrapper = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  width: "100%"
}));

const PasswordInputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.smallest,
  alignItems: "center"
}));

const InnerPage = styled("div")<{
  wide?: boolean;
  transparent?: boolean;
}>(({ wide, transparent, theme }) => ({
  boxSizing: "border-box",
  display: "flex",
  width: "100%",
  maxWidth: wide ? 950 : 750,
  backgroundColor: transparent ? "none" : theme.bg[1],
  borderRadius: theme.radius.normal
}));

const SettingsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  flex: 1,
  ["> div:not(:last-child)"]: {
    borderBottom: `1px solid ${theme.outline.weaker}`
  }
}));

const SettingsFields = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.largest
}));
