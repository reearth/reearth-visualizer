import React from "react";

import { useT } from "@reearth/beta/services/i18n";
import { styled } from "@reearth/beta/services/theme";
import EditableItem from "@reearth/classic/components/molecules/Settings/Project/EditableItem";
import Section from "@reearth/classic/components/molecules/Settings/Section";

export type Props = {
  currentProject?: {
    id: string;
    publicTitle: string;
    publicDescription: string;
    publicImage?: string;
  };
  updatePublicTitle?: (title?: string) => void;
  updatePublicDescription?: (description?: string) => void;
  updatePublicImage?: (imageUrl?: string) => void;
  assetModal?: React.ReactNode;
  toggleAssetModal?: (open?: boolean) => void;
};

const PublicSection: React.FC<Props> = ({
  currentProject,
  updatePublicTitle,
  updatePublicDescription,
  updatePublicImage,
  assetModal,
  toggleAssetModal,
}) => {
  const t = useT();

  return (
    <Wrapper>
      <Section
        title={t("Public Info")}
        subtitle={t(
          "(These fields will be used for OGP as well as metadata for the public project)",
        )}>
        <EditableItem
          title={t("Title")}
          body={currentProject?.publicTitle}
          onSubmit={updatePublicTitle}
        />
        <EditableItem
          title={t("Description")}
          body={currentProject?.publicDescription}
          multilineTextBox={true}
          onSubmit={updatePublicDescription}
        />
        <EditableItem
          title={t("Thumbnail")}
          onSubmit={updatePublicImage}
          imageSrc={currentProject?.publicImage}
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
  background-color: ${props => props.theme.main.paleBg};
`;

export default PublicSection;
