import React, { useCallback, useState, useMemo } from "react";
import { useIntl } from "react-intl";

import Icon from "@reearth/components/atoms/Icon";
import PasswordModal, {
  PasswordPolicy,
} from "@reearth/components/molecules/Settings/Account/PasswordModal";
import Field from "@reearth/components/molecules/Settings/Field";
import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import Section from "@reearth/components/molecules/Settings/Section";
import { localesWithLabel } from "@reearth/locale";
import { styled } from "@reearth/theme";

export type Theme = "dark" | "light" | "default";

export type Props = {
  email?: string;
  appTheme?: string;
  lang?: string;
  hasPassword: boolean;
  passwordPolicy?: PasswordPolicy;
  updatePassword?: (password: string, passwordConfirmation: string) => void;
  updateLanguage?: (lang?: string) => void;
  updateTheme?: (theme: Theme) => void;
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
      { key: "dark", label: intl.formatMessage({ defaultMessage: "Dark theme" }), icon: "moon" },
      { key: "light", label: intl.formatMessage({ defaultMessage: "Light theme" }), icon: "sun" },
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

  const handleThemeUpdate = useCallback(
    (theme?: string) => {
      if (!theme) return;
      updateTheme?.(theme as Theme);
    },
    [updateTheme],
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
          onSubmit={handleThemeUpdate}
        />
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

export default ProfileSection;
