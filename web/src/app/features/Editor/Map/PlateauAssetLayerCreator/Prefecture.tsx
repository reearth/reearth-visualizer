import { useAreas } from "@reearth/services/plateau/graphql";
import { AreaType } from "@reearth/services/plateau/graphql/base/catalog/__gen__/graphql";
import { FC, useMemo } from "react";

import { useExpandedIds } from "./atoms";
import City from "./City";
import { TOKYO_CODE } from "./constants";
import TreeItem, { TreeItemType, TreeItemProps } from "./TreeItem";

export type PrefectureProps = TreeItemProps;

const Prefecture: FC<PrefectureProps> = ({ id, label }) => {
  const [expandedIds, setExpandedIds] = useExpandedIds();
  const expanded = expandedIds.includes(id);
  const handleClick = () => {
    if (expanded) {
      setExpandedIds(expandedIds.filter((expandedId) => expandedId !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const cityData = useAreas({
    parentCode: id,
    areaTypes: [AreaType.City]
  });
  const cities: TreeItemType[] = useMemo(() => {
    if (!cityData.data) return [];

    return cityData.data.areas
      .map((area) => ({
        id: area.code,
        label: area.name
      }))
      .filter((area) => area.id !== TOKYO_CODE);
  }, [cityData]);

  return (
    <TreeItem
      id={id}
      label={label}
      icon={expanded ? "folderNotchOpen" : "folderSimple"}
      onClick={handleClick}
    >
      {expanded &&
        cities.map((city) => (
          <City id={city.id} label={city.label} key={city.id} />
        ))}
    </TreeItem>
  );
};

export default Prefecture;
