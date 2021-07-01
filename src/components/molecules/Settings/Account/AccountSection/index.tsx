import React, { useEffect, useState } from "react";
import PasswordModal from "@reearth/components/molecules/Settings/Account/PasswordModal";
import Section from "@reearth/components/molecules/Settings/Section";
import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import Field from "@reearth/components/molecules/Settings/Field";
import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";
import { useIntl } from "react-intl";

export type Props = {
  email?: string;
  lang?: string;
  hasPassword: boolean;
  updatePassword?: (password: string, passwordConfirmation: string) => void;
  updateLanguage?: (lang: string) => void;
};

const items = [
  { key: "ja", label: "日本語" },
  { key: "en", label: "English" },
];

const ProfileSection: React.FC<Props> = ({
  email,
  hasPassword,
  updatePassword,
  updateLanguage,
}) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>();

  useEffect(() => {
    const lang = items.find(item => item.key === intl.locale);
    setCurrentLang(lang?.label);
  }, [intl.locale]);

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
      </Section>
      <PasswordModal
        hasPassword={hasPassword}
        updatePassword={updatePassword}
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.bg[3]};
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text.strong};
  }
`;

export default ProfileSection;
