import {
  Collapse,
  TextInput,
  Typography,
  IconButton
} from "@reearth/beta/lib/reearth-ui";
import { InputField } from "@reearth/beta/ui/fields";
import { PasswordPolicy } from "@reearth/services/config/passwordPolicy";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useState } from "react";

import { UpdatePasswordType } from "../../hooks";
import { InnerPage, SettingsWrapper, SettingsFields } from "../common";

import PasswordModal from "./PasswordModal";

type Props = {
  imformationData: { name?: string; email?: string };
  passwordPolicy?: PasswordPolicy;
  onUpdateUserPassword: ({
    password,
    passwordConfirmation
  }: UpdatePasswordType) => Promise<void>;
};

const AccountSetting: FC<Props> = ({
  passwordPolicy,
  onUpdateUserPassword,
  imformationData
}) => {
  const t = useT();
  const [onPasswordModalClose, setPasswordModalOnClose] =
    useState<boolean>(true);

  return (
    <InnerPage>
      <SettingsWrapper>
        <Collapse size="large" title={t("Account")}>
          <SettingsFields>
            <InputField
              title={t("Name")}
              value={t(imformationData.name ? imformationData.name : "Red")}
              appearance="readonly"
              disabled
            />
            <InputField
              title={t("Email address")}
              value={t(
                imformationData.email ? imformationData.email : "red@eukarya.io"
              )}
              appearance="readonly"
              disabled
            />

            <PasswordWrapper>
              <Typography size="body">{t("Password")}</Typography>
              <PasswordInputWrapper>
                <TextInput
                  value={t("**********")}
                  appearance="readonly"
                  disabled
                  extendWidth
                />
                <IconButton
                  appearance="secondary"
                  icon="pencilSimple"
                  onClick={() => {
                    setPasswordModalOnClose(!onPasswordModalClose);
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
        isVisible={!onPasswordModalClose}
        passwordPolicy={passwordPolicy}
        onClose={() => setPasswordModalOnClose(!onPasswordModalClose)}
        updatePassword={onUpdateUserPassword}
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
