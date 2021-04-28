import React, { useEffect, useState } from "react";
import PasswordModal from "@reearth/components/molecules/Settings/Account/PasswordModal";
import Section from "@reearth/components/molecules/Settings/Section";
import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import Icon from "@reearth/components/atoms/Icon";
import { styled, useTheme } from "@reearth/theme";
import { useIntl } from "react-intl";
import Text from "@reearth/components/atoms/Text";

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
  const theme = useTheme();

  return (
    <Wrapper>
      <Section title={intl.formatMessage({ defaultMessage: "Account" })}>
        <Item>
          <Header size="m" color={theme.main.text}>
            {intl.formatMessage({ defaultMessage: "Email address" })}
          </Header>
          <Content>{email}</Content>
        </Item>
        <Item>
          <Header size="m" color={theme.main.text}>
            {intl.formatMessage({ defaultMessage: "Password" })}
          </Header>
          <Content>**********</Content>
          <StyledIcon icon="edit" size={20} onClick={() => setIsOpen(!isOpen)} />
        </Item>
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
  width: 100%;
  background-color: ${props => props.theme.colors.bg[3]};
  margin-bottom: 64px;
`;

const Item = styled.div`
  width: 100%;
  &:not(:last-child) {
    margin-bottom: 40px;
  }
`;

const Header = styled(Text)`
  width: 225px;
  display: inline-block;
`;

const Content = styled.div`
  display: inline-block;
`;

const StyledIcon = styled(Icon)`
  display: inline;
  float: right;
  cursor: pointer;
`;

export default ProfileSection;
