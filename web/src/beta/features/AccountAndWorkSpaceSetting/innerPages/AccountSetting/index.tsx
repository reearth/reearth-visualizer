import {
  Collapse,
  TextInput,
  Typography,
  IconButton
} from "@reearth/beta/lib/reearth-ui";
import { InputField, SelectField } from "@reearth/beta/ui/fields";
import { PasswordPolicy } from "@reearth/services/config/passwordPolicy";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useState } from "react";

import { UpdatePasswordType } from "../../hooks";
import { InnerPage, SettingsWrapper, SettingsFields } from "../common";

import PasswordModal from "./PasswordModal";

type Props = {
  informationData: { name?: string; email?: string };
  passwordPolicy?: PasswordPolicy;
  onUpdateUserPassword: ({
    password,
    passwordConfirmation
  }: UpdatePasswordType) => Promise<void>;
  onUpdateUserLanguage: ({ lang }: { lang: string }) => Promise<void>;
};

const AccountSetting: FC<Props> = ({
  passwordPolicy,
  onUpdateUserPassword,
  onUpdateUserLanguage,
  informationData
}) => {
  const t = useT();

  const options = [
    {
      label: t("Auto"),
      value: "und"
    },
    {
      label: "English",
      value: "en"
    },
    {
      label: "日本語",
      value: "ja"
    }
  ];
  type LanguageOption = (typeof options)[number]["value"];
  const [languageLabel, setLanguageLabel] = useState<LanguageOption>("und");

  const [changePasswordModal, setChangePasswordModal] =
    useState<boolean>(false);

  return (
    <InnerPage>
      <SettingsWrapper>
        <Collapse size="large" title={t("Account")}>
          <SettingsFields>
            <InputField
              title={t("Name")}
              value={informationData.name ? t(informationData.name) : ""}
              appearance="readonly"
              disabled
            />
            <InputField
              title={t("Email address")}
              value={informationData.email ? t(informationData.email) : ""}
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
            <SelectField
              title={t("Language")}
              value={languageLabel}
              options={options}
              onChange={(value) => {
                if (typeof value === "string") {
                  setLanguageLabel(value);
                  onUpdateUserLanguage({ lang: value });
                }
              }}
            />
          </SettingsFields>
        </Collapse>
      </SettingsWrapper>

      <PasswordModal
        isVisible={changePasswordModal}
        passwordPolicy={passwordPolicy}
        onClose={() => setChangePasswordModal(false)}
        onPasswordUpdate={onUpdateUserPassword}
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
