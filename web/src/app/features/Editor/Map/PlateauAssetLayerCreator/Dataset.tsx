import { FC } from "react";

import { useSelectedPlateauDatasetId } from "./atoms";
import { datasetTypeIcons, PlateauDatasetType } from "./constants";
import TreeItem, { TreeItemProps } from "./TreeItem";

export type DatasetProps = TreeItemProps & {
  datasetId: string;
  type: PlateauDatasetType;
  level?: number;
};

const Dataset: FC<DatasetProps> = ({
  id,
  datasetId,
  label,
  type,
  level = 0
}) => {
  const [selectedPlateauDatasetId, setSelectedPlateauDatasetId] =
    useSelectedPlateauDatasetId();

  const handleClick = () => {
    if (selectedPlateauDatasetId !== datasetId) {
      setSelectedPlateauDatasetId(datasetId);
    }
  };

  return (
    <TreeItem
      id={id}
      label={label}
      icon={datasetTypeIcons[type]}
      onClick={handleClick}
      selected={selectedPlateauDatasetId === datasetId}
      level={level}
      testId={id}
    />
  );
};

export default Dataset;
