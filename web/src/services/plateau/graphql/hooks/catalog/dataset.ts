import { useMemo } from "react";

import {
  DatasetFragmentFragment,
  DatasetsInput
} from "../../base/catalog/__gen__/graphql";
import {
  DATASETS,
  DATASETS_BY_IDS,
  DATASET_BY_ID
} from "../../base/catalog/queries/dataset";

import { useQuery } from "./base";

type Options = {
  skip?: boolean;
};

export const useDatasets = (input: DatasetsInput, options?: Options) => {
  const { data, ...rest } = useQuery(DATASETS, {
    variables: {
      input
    },
    skip: options?.skip
  });

  const nextDatasets = useMemo(
    () => data?.datasets.slice().sort((a, b) => a.type.order - b.type.order),
    [data]
  );

  return {
    data: data ? { ...data, datasets: nextDatasets } : undefined,
    ...rest
  };
};

export const useDatasetById = (id: string, options?: Options) => {
  const query = useQuery(DATASET_BY_ID, {
    variables: {
      id
    },
    skip: options?.skip
  });

  return {
    ...query,
    data: {
      ...query.data,
      node: query.data?.node as DatasetFragmentFragment
    }
  };
};

export const useDatasetsByIds = (ids: string[], options?: Options) => {
  const query = useQuery(DATASETS_BY_IDS, {
    variables: {
      ids
    },
    skip: options?.skip
  });

  return {
    ...query,
    data: {
      ...query.data,
      nodes: query.data?.nodes as DatasetFragmentFragment[]
    }
  };
};
