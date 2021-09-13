import React from "react";
import { useIntl } from "react-intl";

import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import Section from "@reearth/components/molecules/Settings/Section";
import { styled } from "@reearth/theme";

export type Props = {
  username?: string;
  updateName?: (name: string) => void;
};

const ProfileSection: React.FC<Props> = ({ username, updateName }) => {
  const intl = useIntl();

  return (
    <Wrapper>
      <Section title={intl.formatMessage({ defaultMessage: "Profile" })}>
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Profile picture" })}
          icon="avatar"
          iHeight={"80px"}
        />
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Name" })}
          body={username}
          onSubmit={updateName}
        />
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: ${props => props.theme.main.paleBg};
`;

export default ProfileSection;
