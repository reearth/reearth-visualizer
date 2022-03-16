import React, { useCallback, useState, ComponentType } from "react";
import { useIntl } from "react-intl";

import Icon from "@reearth/components/atoms/Icon";
import { Props as AssetModalPropsType } from "@reearth/components/molecules/Common/AssetModal";
import { styled } from "@reearth/theme";

import TextField from "../TextField";
import { FieldProps } from "../types";

export type AssetModalProps = Pick<
  AssetModalPropsType,
  "isOpen" | "fileType" | "initialAssetUrl" | "onSelect" | "toggleAssetModal"
>;

export type Props = FieldProps<string> & {
  fileType?: "image" | "video";
  assetModal?: ComponentType<AssetModalProps>;
};

const URLField: React.FC<Props> = ({
  name,
  value,
  linked,
  overridden,
  fileType,
  assetModal: AssetModal,
  onChange,
}) => {
  const intl = useIntl();
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
    <Wrapper>
      <InputWrapper>
        <StyledTextField
          name={name}
          value={value ? intl.formatMessage({ defaultMessage: "Field set" }) : undefined}
          onChange={onChange}
          placeholder={intl.formatMessage({ defaultMessage: "Not set" })}
          linked={linked}
          overridden={overridden}
          disabled
          onClick={handleAssetModalOpen}
        />
        {value ? (
          <AssetButton icon="bin" size={18} onClick={deleteValue} />
        ) : fileType === "image" ? (
          <AssetButton icon="image" size={18} active={!linked} onClick={handleAssetModalOpen} />
        ) : fileType === "video" ? (
          <AssetButton icon="video" size={18} active={!linked} onClick={handleAssetModalOpen} />
        ) : (
          <AssetButton icon="resource" size={18} active={!linked} onClick={handleAssetModalOpen} />
        )}
      </InputWrapper>
      {AssetModal && (
        <AssetModal
          isOpen={isAssetModalOpen}
          fileType={fileType}
          initialAssetUrl={value}
          onSelect={handleChange}
          toggleAssetModal={handleAssetModalOpen}
        />
      )}
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
