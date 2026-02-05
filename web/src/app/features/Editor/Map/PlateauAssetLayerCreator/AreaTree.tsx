import { useAreas } from "@reearth/services/plateau/graphql";
import { AreaType } from "@reearth/services/plateau/graphql/base/catalog/__gen__/graphql";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useMemo } from "react";

import Loading from "./Loading";
import Prefecture from "./Prefecture";
import { TreeItemType } from "./TreeItem";

const AreaTree: FC = () => {
  const { data: prefecturesData, loading } = useAreas({
    includeParents: true,
    areaTypes: [AreaType.Prefecture]
  });

  const prefectures: TreeItemType[] = useMemo(() => {
    if (!prefecturesData?.areas) return [];

    return prefecturesData.areas
      .filter((area): area is NonNullable<typeof area> => !!area && !!area.name)
      .map((area) => ({
        id: `area-${area.code}`,
        areaCode: area.code,
        label: area.name ?? ""
      }));
  }, [prefecturesData]);

  return (
    <Wrapper>
      {loading ? (
        <Loading />
      ) : (
        prefectures.map((prefecture) => (
          <Prefecture
            key={prefecture.id}
            id={prefecture.id}
            areaCode={prefecture.areaCode}
            label={prefecture.label}
          />
        ))
      )}
    </Wrapper>
  );
};

export default AreaTree;

const Wrapper = styled("div")(({ theme }) => ({
  height: "100%",
  overflow: css.overflow.auto,
  padding: theme.spacing.smallest,
  ...theme.scrollBar
}));
