import React from "react";
import { useIntl } from "react-intl";

import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import Section from "@reearth/components/molecules/Settings/Section";
import { styled } from "@reearth/theme";

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
  const intl = useIntl();

  return (
    <Wrapper>
      <Section
        title={intl.formatMessage({ defaultMessage: "Public Info" })}
        subtitle={intl.formatMessage({
          defaultMessage:
            "(These fields will be used for OGP as well as metadata for the public project)",
        })}>
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Title" })}
          body={currentProject?.publicTitle}
          onSubmit={updatePublicTitle}
        />
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Description" })}
          body={currentProject?.publicDescription}
          multilineTextBox={true}
          onSubmit={updatePublicDescription}
        />
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Thumbnail" })}
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
