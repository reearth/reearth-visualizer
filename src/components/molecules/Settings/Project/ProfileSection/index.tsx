import React from "react";
import { useIntl } from "react-intl";

import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import Section from "@reearth/components/molecules/Settings/Section";
import { styled } from "@reearth/theme";

export type Props = {
  currentProject?: {
    id: string;
    name: string;
    description: string;
    imageUrl?: string | null;
  };
  updateProjectName?: (name?: string) => void;
  updateProjectDescription?: (description?: string) => void;
  updateProjectImageUrl?: (imageUrl?: string) => void;
  assetModal?: React.ReactNode;
  toggleAssetModal?: (open?: boolean) => void;
};

const ProfileSection: React.FC<Props> = ({
  currentProject,
  updateProjectName,
  updateProjectDescription,
  updateProjectImageUrl,
  assetModal,
  toggleAssetModal,
}) => {
  const intl = useIntl();

  return (
    <Wrapper>
      <Section title={intl.formatMessage({ defaultMessage: "Project Info" })}>
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Name" })}
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
          imageSrc={currentProject?.imageUrl as string}
          isImage
          onEditStart={() => toggleAssetModal?.(true)}
          onEditCancel={() => toggleAssetModal?.(false)}
        />
      </Section>
      {assetModal}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: ${props => props.theme.main.lighterBg};
`;

export default ProfileSection;
