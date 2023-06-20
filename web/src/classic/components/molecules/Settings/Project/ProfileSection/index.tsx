import React from "react";

import EditableItem from "@reearth/classic/components/molecules/Settings/Project/EditableItem";
import Section from "@reearth/classic/components/molecules/Settings/Section";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

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
  const t = useT();

  return (
    <Wrapper>
      <Section title={t("Project Info")}>
        <EditableItem title={t("Name")} body={currentProject?.name} onSubmit={updateProjectName} />
        <EditableItem
          title={t("Description")}
          body={currentProject?.description}
          multilineTextBox={true}
          onSubmit={updateProjectDescription}
        />
        <EditableItem
          title={t("Thumbnail")}
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
  background-color: ${props => props.theme.classic.main.lighterBg};
`;

export default ProfileSection;
