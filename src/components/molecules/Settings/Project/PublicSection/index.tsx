import React, { useCallback, useState } from "react";
import Section from "@reearth/components/molecules/Settings/Section";
import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import AssetModal, { Asset as AssetType } from "@reearth/components/molecules/Common/AssetModal";
import { styled } from "@reearth/theme";
import { useIntl } from "react-intl";

export type Asset = AssetType;

export type Props = {
  currentProject?: {
    id: string;
    publicTitle: string;
    publicDescription: string;
    publicImage?: string;
  };
  assets?: Asset[];
  updatePublicTitle?: (title: string) => void;
  updatePublicDescription?: (description: string) => void;
  updatePublicImage?: (imageUrl: string | null) => void;
  createAssets?: (files: FileList) => Promise<void>;
};

const PublicSection: React.FC<Props> = ({
  currentProject,
  updatePublicTitle,
  updatePublicDescription,
  updatePublicImage,
  assets,
  createAssets,
}) => {
  const intl = useIntl();
  const [isAssetModalOpen, setAssetModalOpen] = useState(false);
  const openAssetModal = useCallback(() => setAssetModalOpen(true), []);
  const closeAssetModal = useCallback(() => setAssetModalOpen(false), []);

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
          onEditStart={() => openAssetModal()}
          onEditCancel={() => closeAssetModal()}
        />
      </Section>
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={closeAssetModal}
        assets={assets}
        fileType="image"
        onCreateAsset={createAssets}
        onSelect={updatePublicImage}
        value={currentProject?.publicImage}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: ${props => props.theme.colors.bg[3]};
`;

export default PublicSection;
