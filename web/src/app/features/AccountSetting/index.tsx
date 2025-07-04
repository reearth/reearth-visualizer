import useAccountSettingsTabs from "@reearth/app/hooks/useAccountSettingsTabs";
import { TextInput, Typography, IconButton } from "@reearth/app/lib/reearth-ui";
import SettingBase from "@reearth/app/ui/components/SettingBase";
import { InputField, SelectField } from "@reearth/app/ui/fields";
import { useT } from "@reearth/services/i18n";
import { useWorkspace } from "@reearth/services/state";
import { styled } from "@reearth/services/theme";
import { FC, useState } from "react";

import CursorStatus from "../CursorStatus";

import useHook from "./hooks";
import PasswordModal from "./PasswordModal";

const AccountSetting: FC = () => {
  const t = useT();
  const [changePasswordModal, setChangePasswordModal] =
    useState<boolean>(false);

  const {
    meData,
    passwordPolicy,
    handleUpdateUserPassword,
    handleUpdateUserLanguage
  } = useHook();
  const [currentWorkspace] = useWorkspace();

  const { tabs } = useAccountSettingsTabs({
    workspaceId: currentWorkspace?.id ?? ""
  });

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

  return (
    <>
      <SettingBase tabs={tabs} tab={"account"}>
        <InnerPage data-testid="inner-page" wide>
          <SettingsWrapper>
            <TitleWrapper size="body" weight="bold">
              {t("Account")}
            </TitleWrapper>
            <SettingsFields>
              <InputField
                title={t("Name")}
                value={meData.name ? t(meData.name) : ""}
                appearance="readonly"
                disabled
              />
              <InputField
                title={t("Email address")}
                value={meData.email ? t(meData.email) : ""}
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
                    data-testid="change-password-button"
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
                value={meData.lang ?? "und"}
                options={options}
                onChange={(value) => {
                  handleUpdateUserLanguage({ lang: value as string });
                }}
              />
            </SettingsFields>
          </SettingsWrapper>

          <PasswordModal
            isVisible={changePasswordModal}
            passwordPolicy={passwordPolicy}
            onClose={() => setChangePasswordModal(false)}
            handleUpdateUserPassword={handleUpdateUserPassword}
          />
        </InnerPage>
      </SettingBase>
      <CursorStatus />
    </>
  );
};
export default AccountSetting;

const PasswordWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

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
  },
  padding: `${theme.spacing.normal}px ${theme.spacing.largest}px ${theme.spacing.largest}px`
}));

const SettingsFields = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.largest
}));

const TitleWrapper = styled(Typography)(({ theme }) => ({
  color: theme.content.main,
  paddingBottom: theme.spacing.normal
}));
