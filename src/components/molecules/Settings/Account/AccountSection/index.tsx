import React, { useCallback, useState, useMemo } from "react";
import { useIntl } from "react-intl";

import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import PasswordModal, {
  PasswordPolicy,
} from "@reearth/components/molecules/Settings/Account/PasswordModal";
import Field from "@reearth/components/molecules/Settings/Field";
import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import Section from "@reearth/components/molecules/Settings/Section";
import { localesWithLabel } from "@reearth/locale";
import { styled } from "@reearth/theme";

export type Theme = "DARK" | "LIGHT";

export type Props = {
  email?: string;
  appTheme?: string;
  lang?: string;
  hasPassword: boolean;
  passwordPolicy?: PasswordPolicy;
  updatePassword?: (password: string, passwordConfirmation: string) => void;
  updateLanguage?: (lang: string) => void;
  updateTheme?: (theme: string) => void;
};

const ProfileSection: React.FC<Props> = ({
  lang,
  email,
  appTheme,
  hasPassword,
  passwordPolicy,
  updatePassword,
  updateLanguage,
  updateTheme,
}) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);

  const langItems = useMemo(
    () => [
      { key: "und", label: intl.formatMessage({ defaultMessage: "Auto" }) },
      ...Object.keys(localesWithLabel).map(l => ({
        key: l as keyof typeof localesWithLabel,
        label: localesWithLabel[l as keyof typeof localesWithLabel],
      })),
    ],
    [intl],
  );

  const themeItems: { key: Theme; label: string; icon: string }[] = useMemo(
    () => [
      { key: "DARK", label: intl.formatMessage({ defaultMessage: "Dark theme" }), icon: "moon" },
      { key: "LIGHT", label: intl.formatMessage({ defaultMessage: "Light theme" }), icon: "sun" },
    ],
    [intl],
  );

  const currentThemeLabel = useMemo(
    () => themeItems.find(themeItem => themeItem.key === appTheme)?.label,
    [appTheme, themeItems],
  );

  const currentLang = useMemo(
    () => langItems.find(item => item.key === lang)?.label,
    [lang, langItems],
  );

  const handleUpdatePassword = useCallback(
    (password: string, passwordConfirmation: string) => {
      updatePassword?.(password, passwordConfirmation);
      setIsOpen(false);
    },
    [updatePassword],
  );

  return (
    <Wrapper>
      <Section title={intl.formatMessage({ defaultMessage: "Account" })}>
        <Field header={intl.formatMessage({ defaultMessage: "Email address" })} body={email} />
        <Field
          header={intl.formatMessage({ defaultMessage: "Password" })}
          body={"**********"}
          action={<StyledIcon icon="edit" size={20} onClick={() => setIsOpen(!isOpen)} />}
        />
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Service language" })}
          dropdown
          dropdownItems={langItems}
          currentItem={lang || "und"}
          body={currentLang}
          onSubmit={updateLanguage}
        />
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Color theme" })}
          dropdown
          dropdownItems={themeItems}
          currentItem={appTheme}
          body={currentThemeLabel}
          onSubmit={updateTheme}
        />
        <Notice>
          <AlertIcon icon="alert" size={16} />
          <Message>
            <StyledText size="xs">
              {intl.formatMessage({
                defaultMessage:
                  "Light theme is still in beta. Some UI may still not be supported (ie. public projects will not use light theme).",
              })}
            </StyledText>
          </Message>
        </Notice>
      </Section>
      <PasswordModal
        hasPassword={hasPassword}
        passwordPolicy={passwordPolicy}
        updatePassword={handleUpdatePassword}
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.main.paleBg};
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.main.strongText};
  }
`;

const AlertIcon = styled(Icon)`
  color: ${({ theme }) => theme.main.warning};
`;

const Notice = styled(Flex)`
  margin-left: 184px;
`;

const Message = styled.div`
  max-width: 500px;
`;

const StyledText = styled(Text)`
  margin-left: 12px;
  font-style: italic;
`;

export default ProfileSection;
