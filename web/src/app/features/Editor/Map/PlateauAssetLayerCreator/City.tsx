import { useDatasets } from "@reearth/services/plateau/graphql";
import { FC, useMemo } from "react";

import { useExpandedPlateauFolderIds } from "./atoms";
import { PlateauDatasetType } from "./constants";
import Dataset from "./Dataset";
import TreeItem, { TreeItemProps } from "./TreeItem";

export type CityProps = TreeItemProps & {
  areaCode?: string;
  type?: string;
};

const City: FC<CityProps> = ({ id, areaCode, label, level = 0, type }) => {
  const [expandedIds, setExpandedIds] = useExpandedPlateauFolderIds();
  const expanded = expandedIds.includes(id);
  const handleClick = () => {
    if (expanded) {
      setExpandedIds(expandedIds.filter((expandedId) => expandedId !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const datasetData = useDatasets({
    areaCodes: [areaCode],
    ...(type ? { includeTypes: [type] } : {})
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
      level={level}
    >
      {expanded &&
        datasets.map((dataset) => (
          <Dataset
            id={`${id}-dataset-${dataset.id}`}
            datasetId={dataset.id}
            label={dataset.label}
            type={dataset.type}
            key={dataset.id}
            level={level + 1}
          />
        ))}
    </TreeItem>
  );
};

export default City;
