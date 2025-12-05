import { useAreas } from "@reearth/services/plateau/graphql";
import { AreaType } from "@reearth/services/plateau/graphql/base/catalog/__gen__/graphql";
import { FC, useMemo } from "react";

import { useExpandedPlateauFolderIds } from "./atoms";
import City from "./City";
import { TOKYO_CODE } from "./constants";
import TreeItem, { TreeItemType, TreeItemProps } from "./TreeItem";

export type PrefectureProps = TreeItemProps & {
  areaCode?: string;
  type?: string;
};

const Prefecture: FC<PrefectureProps> = ({
  id,
  areaCode,
  label,
  level = 0,
  type
}) => {
  const [expandedIds, setExpandedIds] = useExpandedPlateauFolderIds();
  const expanded = expandedIds.includes(id);
  const handleClick = () => {
    if (expanded) {
      setExpandedIds(expandedIds.filter((expandedId) => expandedId !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const cityData = useAreas({
    parentCode: areaCode,
    areaTypes: [AreaType.City],
    ...(type ? { datasetTypes: [type] } : {})
  });
  const cities: TreeItemType[] = useMemo(() => {
    if (!cityData.data) return [];

    return cityData.data.areas
      .map((area) => ({
        id: `${id}-city-${area.code}`,
        areaCode: area.code,
        label: area.name
      }))
      .filter((area) => area.id !== TOKYO_CODE);
  }, [cityData, id]);

  return (
    <TreeItem
      id={id}
      label={label}
      icon={expanded ? "folderNotchOpen" : "folderSimple"}
      onClick={handleClick}
      level={level}
      testId={id}
    >
      {expanded &&
        cities.map((city) => (
          <City
            id={city.id}
            label={city.label}
            key={city.id}
            level={level + 1}
            type={type}
            areaCode={city.areaCode}
          />
        ))}
    </TreeItem>
  );
};

export default Prefecture;
