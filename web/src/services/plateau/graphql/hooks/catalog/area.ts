import { useMemo } from "react";

import { AREAS, AREA_DATASETS } from "../../base/catalog/queries/area";
import { TOKYO_SAMPLE_DATA_CITY_CODE } from "../../constants";
import { AreasInput, DatasetsInput } from "../../types/catalog";

import { useQuery } from "./base";

type Options = {
  skip?: boolean;
};

export const useAreas = (input?: AreasInput, options?: Options) => {
  const data = useQuery(AREAS, {
    variables: {
      input: input ?? {}
    },
    skip: options?.skip
  });
  const next = useMemo(
    () => ({
      ...data,
      isLoading: data.loading,
      data: data.data
        ? {
            ...data.data,
            areas: data.data.areas.filter(
              (a) => a.code !== TOKYO_SAMPLE_DATA_CITY_CODE
            )
          }
        : undefined
    }),
    [data]
  );

  return next;
};

export const useAreaDatasets = (
  code: string,
  input?: DatasetsInput,
  options?: Options
) => {
  const { data, ...rest } = useQuery(AREA_DATASETS, {
    variables: {
      code,
      input: input ?? {}
    },
    skip: options?.skip
  });

  const nextDatasets = useMemo(
    () =>
      data?.area?.datasets
        .map((d) =>
          d.cityCode === TOKYO_SAMPLE_DATA_CITY_CODE
            ? { ...d, cityCode: null, city: null }
            : d
        )
        .sort((a, b) => a.type.order - b.type.order),
    [data]
  );

  return {
    data: data
      ? {
          ...data,
          ...(data.area
            ? { area: { ...data.area, datasets: nextDatasets } }
            : {})
        }
      : undefined,
    isLoading: rest.loading,
    ...rest
  };
};
