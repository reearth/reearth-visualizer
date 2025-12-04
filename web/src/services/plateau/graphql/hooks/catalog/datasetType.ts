import { useEffect, useState } from "react";

import { DatasetTypesInput } from "../../base/catalog/__gen__/graphql";
import { DATASET_TYPES } from "../../base/catalog/queries/datasetType";

import { useQuery } from "./base";

type Options = {
  skip?: boolean;
};

export const useDatasetTypes = (input?: DatasetTypesInput, options?: Options) => {
  const { data, ...rest } = useQuery(DATASET_TYPES, {
    variables: {
      input,
    },
    skip: options?.skip,
  });

  const [datasetTypes, setDatasetTypes] = useState(
    data?.datasetTypes.slice().sort((a, b) => a.order - b.order),
  );

  useEffect(() => {
    if (data?.datasetTypes && !datasetTypes) {
      setDatasetTypes(data.datasetTypes.slice().sort((a, b) => a.order - b.order));
    }
  }, [data?.datasetTypes, datasetTypes]);

  return { data: datasetTypes, ...rest };
};
