import React from "react";
import { useIntl } from "react-intl";
import useFileInput from "use-file-input";
import { styled } from "@reearth/theme";
import Section from "@reearth/components/molecules/Settings/Section";
import AssetList from "@reearth/components/molecules/Settings/Workspace/Asset/AssetList";
import Button from "@reearth/components/atoms/Button";

type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

type Props = {
  assets?: Asset[];
  onCreate?: (files: FileList) => void;
  onRemove?: (id: string) => void;
};

const AssetSection: React.FC<Props> = ({ assets = [], onCreate, onRemove }) => {
  const intl = useIntl();
  const handleFileSelect = useFileInput(files => onCreate?.(files), { multiple: true });

  return (
    <Section
      title={`${intl.formatMessage({ defaultMessage: "All Assets" })} (${assets?.length})`}
      actions={
        <Button
          large
          buttonType="secondary"
          text={intl.formatMessage({ defaultMessage: "Add Asset" })}
          onClick={handleFileSelect}
        />
      }>
      <StyledAssetList items={assets} onRemove={onRemove} />
    </Section>
  );
};

const StyledAssetList = styled(AssetList)`
  justify-self: center;
`;

export default AssetSection;
