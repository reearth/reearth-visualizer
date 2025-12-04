import { FC } from "react";

import { useSelectedId } from "./atoms";
import { datasetTypeIcons, PlateauDatasetType } from "./constants";
import TreeItem, { TreeItemProps } from "./TreeItem";

export type DatasetProps = TreeItemProps & { type: PlateauDatasetType };

const Dataset: FC<DatasetProps> = ({ id, label, type }) => {
  const [selectedId, setSelectedId] = useSelectedId();

  const handleClick = () => {
    if (selectedId !== id) {
      setSelectedId(id);
    }
  };

  return (
    <TreeItem
      id={id}
      label={label}
      icon={datasetTypeIcons[type]}
      onClick={handleClick}
      selected={selectedId === id}
      level={2}
    />
  );
};

export default Dataset;
