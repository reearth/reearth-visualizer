import React from "react";
import useFileInput from "use-file-input";

import Button from "@reearth/classic/components/atoms/Button";
import DatasetList, {
  Item,
} from "@reearth/classic/components/molecules/Settings/Project/Dataset/DatasetList";
import Section from "@reearth/classic/components/molecules/Settings/Section";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  datasetSchemas: Item[];
  removeDatasetSchema: (schemaId: string) => void;
  onDatasetImport?: (file: File, datasetSchemaId: string | null) => void | Promise<void>;
  onDownloadFile?: (id: string, name: string, onLoad: () => void) => void;
};

const DatasetSection: React.FC<Props> = ({
  datasetSchemas,
  removeDatasetSchema,
  onDatasetImport,
  onDownloadFile,
}) => {
  const t = useT();
  const handleFileSelect = useFileInput(files => onDatasetImport?.(files[0], null), {
    multiple: false,
    accept: "text/csv",
  });

  return (
    <Section
      title={t("Dataset")}
      actions={
        <Button large buttonType="secondary" text={t("Add Dataset")} onClick={handleFileSelect} />
      }>
      <StyledDatasetList
        items={datasetSchemas}
        removeDatasetSchema={removeDatasetSchema}
        onDownloadFile={onDownloadFile}
      />
    </Section>
  );
};

const StyledDatasetList = styled(DatasetList)`
  justify-self: center;
`;

export default DatasetSection;
