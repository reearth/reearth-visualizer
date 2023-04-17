import React from "react";

import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import Section from "@reearth/components/molecules/Settings/Section";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

export type Props = {
  username?: string;
  updateName?: (name?: string) => void;
};

const ProfileSection: React.FC<Props> = ({ username, updateName }) => {
  const t = useT();

  return (
    <Wrapper>
      <Section title={t("Profile")}>
        <EditableItem title={t("Profile picture")} avatar={username} iHeight={"80px"} />

        <EditableItem title={t("Name")} body={username} onSubmit={updateName} />
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: ${props => props.theme.main.paleBg};
`;

export default ProfileSection;
