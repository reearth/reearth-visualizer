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
    name: string;
    description: string;
    imageUrl?: string | null;
  };
  updateProjectName?: (name: string) => void;
  updateProjectDescription?: (description: string) => void;
  updateProjectImageUrl?: (imageUrl: string | null) => void;
  assets?: Asset[];
  createAssets?: (file: File) => Promise<void>;
};

const ProfileSection: React.FC<Props> = ({
  currentProject,
  updateProjectName,
  updateProjectDescription,
  updateProjectImageUrl,
  assets,
  createAssets,
}) => {
  const intl = useIntl();
  const [isAssetModalOpen, setAssetModalOpen] = useState(false);
  const openAssetModal = useCallback(() => setAssetModalOpen(true), []);
  const closeAssetModal = useCallback(() => setAssetModalOpen(false), []);

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
        onSelect={updateProjectImageUrl}
        value={currentProject?.imageUrl as string | undefined}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.bg[3]};
  margin-bottom: 64px;
`;

export default ProfileSection;
