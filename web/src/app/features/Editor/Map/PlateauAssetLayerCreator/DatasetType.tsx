import { useAreas } from "@reearth/services/plateau/graphql";
import { AreaType } from "@reearth/services/plateau/graphql/types/catalog";
import { FC, useMemo } from "react";

import { useExpandedPlateauFolderIds } from "./atoms";
import Prefecture from "./Prefecture";
import TreeItem, { TreeItemType, TreeItemProps } from "./TreeItem";

export type DatasetTypeProps = TreeItemProps & {
  datasetType: string;
};

const DatasetType: FC<DatasetTypeProps> = ({ id, label, datasetType }) => {
  const [expandedIds, setExpandedIds] = useExpandedPlateauFolderIds();
  const expanded = expandedIds.includes(id);
  const handleClick = () => {
    if (expanded) {
      setExpandedIds(expandedIds.filter((expandedId) => expandedId !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const { data: prefecturesData } = useAreas({
    includeParents: true,
    datasetTypes: [datasetType],
    areaTypes: [AreaType.Prefecture]
  });

  const prefectures: TreeItemType[] = useMemo(() => {
    if (!prefecturesData?.areas) return [];

    return prefecturesData.areas
      .filter((area): area is NonNullable<typeof area> => !!area && !!area.name)
      .map((area) => ({
        id: `${id}-prefecture-${area.code}`,
        areaCode: area.code,
        label: area.name ?? ""
      }));
  }, [prefecturesData, id]);

  return (
    <TreeItem
      id={id}
      label={label}
      icon={expanded ? "folderNotchOpen" : "folderSimple"}
      onClick={handleClick}
      testId={id}
    >
      {expanded &&
        prefectures.map((prefecture) => (
          <Prefecture
            key={prefecture.id}
            id={prefecture.id}
            areaCode={prefecture.areaCode}
            label={prefecture.label}
            type={datasetType}
            level={1}
          />
        ))}
    </TreeItem>
  );
};

export default DatasetType;
