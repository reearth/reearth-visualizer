import React from "react";
import Section from "@reearth/components/molecules/Settings/Section";
import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import { styled } from "@reearth/theme";
import { useIntl } from "react-intl";

export type Props = {
  currentProject?: {
    id: string;
    name: string;
    description: string;
    imageUrl?: string | null;
  };
  updateProjectName?: (name: string) => void;
  updateProjectDescription?: (description: string) => void;
  updateProjectImageUrl?: (imageUrl: string | null) => void;
};

const ProfileSection: React.FC<Props> = ({
  currentProject,
  updateProjectName,
  updateProjectDescription,
  updateProjectImageUrl,
}) => {
  const intl = useIntl();

  return (
    <Wrapper>
      <Section title={intl.formatMessage({ defaultMessage: "Profile" })}>
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Project name" })}
          body={currentProject?.name}
          onSubmit={updateProjectName}
        />
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Description" })}
          body={currentProject?.description}
          multilineTextBox={true}
          onSubmit={updateProjectDescription}
        />
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Thumbnail" })}
          onSubmit={updateProjectImageUrl}
          image={currentProject?.imageUrl as string}
        />
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.bg[3]};
  margin-bottom: 64px;
`;

export default ProfileSection;
