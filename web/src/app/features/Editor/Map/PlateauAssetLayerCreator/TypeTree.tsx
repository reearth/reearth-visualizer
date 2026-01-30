import { useDatasetTypes } from "@reearth/services/plateau/graphql";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { unionBy } from "lodash-es";
import { FC, useMemo } from "react";

import { EXCLUDE_TYPES, PlateauDatasetType } from "./constants";
import DatasetType from "./DatasetType";
import Loading from "./Loading";

type DatasetType = {
  id: string;
  name: string;
  code: string;
};

const TypeBrowser: FC = () => {
  const { data: datasetTypeOrder, loading } = useDatasetTypes();
  const types: DatasetType[] = useMemo(
    () =>
      unionBy(datasetTypeOrder, "name").filter(
        (type) => !EXCLUDE_TYPES.includes(type.code as PlateauDatasetType)
      ) ?? [],
    [datasetTypeOrder]
  );

  return (
    <Wrapper>
      {loading ? (
        <Loading />
      ) : (
        types?.map((type) => (
          <DatasetType
            id={`type-${type.id}`}
            key={type.id}
            label={type.name}
            datasetType={type.code}
          />
        ))
      )}
    </Wrapper>
  );
};

export default TypeBrowser;

const Wrapper = styled("div")(({ theme }) => ({
  height: "100%",
  overflow: css.overflow.auto,
  padding: theme.spacing.smallest,
  ...theme.scrollBar
}));
