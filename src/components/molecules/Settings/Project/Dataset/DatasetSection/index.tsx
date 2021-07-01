import React from "react";
import { useIntl } from "react-intl";
import useFileInput from "use-file-input";

import { styled } from "@reearth/theme";
import Button from "@reearth/components/atoms/Button";
import Section from "@reearth/components/molecules/Settings/Section";
import DatasetList, {
  Item,
} from "@reearth/components/molecules/Settings/Project/Dataset/DatasetList";

type Props = {
  datasetSchemas: Item[];
  importDataset: (file: FileList) => void;
  removeDatasetSchema: (schemaId: string) => void;
};

const DatasetSection: React.FC<Props> = ({
  datasetSchemas,
  importDataset,
  removeDatasetSchema,
}) => {
  const intl = useIntl();
  const handleFileSelect = useFileInput(files => importDataset?.(files), {
    multiple: false,
    accept: "text/csv",
  });

  return (
    <Section
      title={intl.formatMessage({ defaultMessage: "Dataset" })}
      actions={
        <Button
          large
          buttonType="secondary"
          text={intl.formatMessage({ defaultMessage: "Add Dataset" })}
          onClick={handleFileSelect}
        />
      }>
      <StyledDatasetList items={datasetSchemas} removeDatasetSchema={removeDatasetSchema} />
    </Section>
  );
};

const StyledDatasetList = styled(DatasetList)`
  justify-self: center;
`;

export default DatasetSection;
