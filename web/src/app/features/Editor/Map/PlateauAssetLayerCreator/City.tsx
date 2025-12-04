import { useDatasets } from "@reearth/services/plateau/graphql";
import { FC, useMemo } from "react";

import { useExpandedIds } from "./atoms";
import { PlateauDatasetType } from "./constants";
import Dataset from "./Dataset";
import TreeItem, { TreeItemProps } from "./TreeItem";

export type CityProps = TreeItemProps;

const City: FC<CityProps> = ({ id, label }) => {
  const [expandedIds, setExpandedIds] = useExpandedIds();
  const expanded = expandedIds.includes(id);
  const handleClick = () => {
    if (expanded) {
      setExpandedIds(expandedIds.filter((expandedId) => expandedId !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const datasetData = useDatasets({
    areaCodes: [id]
  });

  const datasets = useMemo(() => {
    if (!datasetData.data?.datasets) return [];

    return datasetData.data.datasets?.map((dataset) => ({
      id: dataset.id,
      label: dataset.name,
      type: dataset.type.code as PlateauDatasetType
    }));
  }, [datasetData]);

  return (
    <TreeItem
      id={id}
      label={label}
      icon={expanded ? "folderNotchOpen" : "folderSimple"}
      onClick={handleClick}
      level={1}
    >
      {expanded &&
        datasets.map((dataset) => (
          <Dataset
            id={dataset.id}
            label={dataset.label}
            type={dataset.type}
            key={dataset.id}
          />
        ))}
    </TreeItem>
  );
};

export default City;
