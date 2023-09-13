import React, { useCallback, useState, ComponentType } from "react";

import Property from "@reearth/beta/components/fields";
import TextInput from "@reearth/beta/components/fields/common/TextInput";
import { useManageAssets } from "@reearth/beta/features/Assets/useManageAssets/hooks";
import { Props as AssetModalPropsType } from "@reearth/classic/components/molecules/Common/AssetModal";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Button from "../../Button";

export type AssetModalProps = Pick<
  AssetModalPropsType,
  "isOpen" | "videoOnly" | "initialAssetUrl" | "onSelect" | "toggleAssetModal"
>;

export type Props = {
  value?: string;
  onChange?: (value: string | undefined) => void;
  name?: string;
  description?: string;
  fileType?: "Asset" | "URL";
  assetType?: "Image" | "File";
  assetModal?: ComponentType<AssetModalProps>;
};

const URLField: React.FC<Props> = ({
  name,
  description,
  value,
  fileType,
  assetType,
  assetModal: AssetModal,
  onChange,
}) => {
  const t = useT();
  const [isAssetModalOpen, setAssetModalOpen] = useState(false);
  //const deleteValue = useCallback(() => onChange?.(undefined), [onChange]);

  const { handleUploadToAsset } = useManageAssets({});

  const handleAssetModalOpen = useCallback(() => {
    setAssetModalOpen(!isAssetModalOpen);
  }, [isAssetModalOpen]);

  const handleChange = useCallback(
    (value?: string) => {
      if (!value) return;
      onChange?.(value);
    },
    [onChange],
  );

  return (
    <Property name={name} description={description}>
      <StyledTextField
        value={value ? t("Field set") : undefined}
        onChange={onChange}
        placeholder={t("Not set")}
      />
      {fileType === "Asset" && (
        <ButtonWrapper>
          <AssetButton
            icon={assetType === "Image" ? "imageStoryBlock" : "file"}
            text={t("Choose")}
            iconPosition="left"
            onClick={handleAssetModalOpen}
          />
          <AssetButton
            icon="uploadSimple"
            text={t("Upload")}
            iconPosition="left"
            onClick={handleUploadToAsset}
          />
        </ButtonWrapper>
      )}
      {AssetModal && (
        <AssetModal
          isOpen={isAssetModalOpen}
          videoOnly={fileType == "URL"}
          initialAssetUrl={value}
          onSelect={handleChange}
          toggleAssetModal={handleAssetModalOpen}
        />
      )}
    </Property>
  );
};

const AssetButton = styled(Button)<{ active?: boolean }>`
  cursor: pointer;
  margin-left: 6px;
  padding: 4px;
  border-radius: 6px;
  width: 127px;
  color: ${props => props.theme.classic.main.text};

  &:hover {
    background: ${props => props.theme.classic.main.bg};
  }
`;

const StyledTextField = styled(TextInput)<{ canUpload?: boolean }>``;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  align-self: stretch;
`;

export default URLField;
