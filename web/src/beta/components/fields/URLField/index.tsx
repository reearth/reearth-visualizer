import React, { useCallback, useState, ComponentType } from "react";

import Property from "@reearth/beta/components/fields";
import TextField from "@reearth/beta/components/fields/TextInput";
import Icon from "@reearth/beta/components/Icon";
import { Props as AssetModalPropsType } from "@reearth/classic/components/molecules/Common/AssetModal";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

export type AssetModalProps = Pick<
  AssetModalPropsType,
  "isOpen" | "videoOnly" | "initialAssetUrl" | "onSelect" | "toggleAssetModal"
>;

export type Props = {
  value?: string;
  onChange?: (value: string | undefined) => void;
  name: string;
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
  // assetType,
  assetModal: AssetModal,
  onChange,
}) => {
  const t = useT();
  const [isAssetModalOpen, setAssetModalOpen] = useState(false);
  const deleteValue = useCallback(() => onChange?.(undefined), [onChange]);

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
      {value ? (
        <AssetButton icon="bin" size={18} onClick={deleteValue} />
      ) : fileType === "Asset" ? (
        <AssetButton icon="image" size={18} onClick={handleAssetModalOpen} />
      ) : fileType === "URL" ? (
        <AssetButton icon="video" size={18} onClick={handleAssetModalOpen} />
      ) : (
        <AssetButton icon="resource" size={18} onClick={handleAssetModalOpen} />
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

const AssetButton = styled(Icon)<{ active?: boolean }>`
  cursor: pointer;
  margin-left: 6px;
  padding: 4px;
  border-radius: 6px;
  color: ${props => props.theme.classic.main.text};

  &:hover {
    background: ${props => props.theme.classic.main.bg};
  }
`;

const StyledTextField = styled(TextField)<{ canUpload?: boolean }>``;

export default URLField;
