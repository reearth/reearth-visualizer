import React, { useCallback, useState, useMemo } from "react";
import PasswordModal from "@reearth/components/molecules/Settings/Account/PasswordModal";
import Section from "@reearth/components/molecules/Settings/Section";
import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import Field from "@reearth/components/molecules/Settings/Field";
import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";
import { useIntl } from "react-intl";
import Text from "@reearth/components/atoms/Text";
import Flex from "@reearth/components/atoms/Flex";

export type Theme = "DARK" | "LIGHT";

export type Props = {
  email?: string;
  appTheme?: string;
  lang?: string;
  hasPassword: boolean;
  updatePassword?: (password: string, passwordConfirmation: string) => void;
  updateLanguage?: (lang: string) => void;
  updateTheme?: (theme: string) => void;
};

const items = [
  { key: "ja", label: "日本語" },
  { key: "en", label: "English" },
];

const ProfileSection: React.FC<Props> = ({
  email,
  appTheme,
  hasPassword,
  updatePassword,
  updateLanguage,
  updateTheme,
}) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);

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
    () => items.find(item => item.key === intl.locale)?.label,
    [intl.locale],
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
          dropdownItems={items}
          currentItem={intl.locale}
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
