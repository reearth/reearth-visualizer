import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";

import { styled } from "@reearth/theme";
import Icon from "@reearth/components/atoms/Icon";
import TextField from "../TextField";
import { FieldProps } from "../types";
import AssetModal, { Asset as AssetType } from "@reearth/components/molecules/Common/AssetModal";

export type Asset = AssetType;

export type Props = FieldProps<string> & {
  onRemoveFile?: () => void;
  fileType?: "image" | "video" | "file";
  assets?: Asset[];
  onCreateAsset?: (files: FileList) => void;
};

const URLField: React.FC<Props> = ({
  name,
  value,
  onChange,
  linked,
  overridden,
  onCreateAsset,
  fileType,
  assets,
}) => {
  const intl = useIntl();
  const [isAssetModalOpen, setAssetModalOpen] = useState(false);
  const openAssetModal = useCallback(() => setAssetModalOpen(true), []);
  const closeAssetModal = useCallback(() => setAssetModalOpen(false), []);

  return (
    <Wrapper>
      <InputWrapper>
        <StyledTextField
          name={name}
          value={value}
          onChange={onChange}
          placeholder={intl.formatMessage({ defaultMessage: "Not set" })}
          linked={linked}
          overridden={overridden}
          disabled
          onClick={openAssetModal}
        />
        {value ? (
          <AssetButton icon="bin" size={18} onClick={() => onChange?.(null)} />
        ) : fileType === "image" ? (
          <AssetButton icon="image" size={18} active={!linked} onClick={openAssetModal} />
        ) : fileType === "video" ? (
          <AssetButton icon="video" size={18} active={!linked} onClick={openAssetModal} />
        ) : (
          <AssetButton icon="resource" size={18} active={!linked} onClick={openAssetModal} />
        )}
      </InputWrapper>
      <AssetModal
        isOpen={isAssetModalOpen}
        onClose={closeAssetModal}
        assets={assets}
        fileType={fileType}
        onCreateAsset={onCreateAsset}
        onSelect={onChange}
        value={value}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
`;

const InputWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AssetButton = styled(Icon)<{ active?: boolean }>`
  cursor: pointer;
  margin-left: 6px;
  padding: 4px;
  border-radius: 6px;
  color: ${props => props.theme.main.text};

  &:hover {
    background: ${props => props.theme.main.bg};
  }
`;

const StyledTextField = styled(TextField)<{ canUpload?: boolean }>``;

export default URLField;
