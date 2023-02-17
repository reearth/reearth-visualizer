import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { PublishedData } from "@reearth/components/organisms/Published/core/types";
import { useGetScenePropertyQuery } from "@reearth/gql";

// TODO: Remove this hook when we use reearth/core completely.
export const useCore = (
  type?: "published" | "earth_editor",
  alias?: string,
): boolean | undefined => {
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  if (query.has("useCore") || type === undefined) {
    return query.has("useCore");
  }

  if (type === "earth_editor") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { sceneId } = useParams();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useGetScenePropertyQuery({
      variables: { sceneId: sceneId ?? "" },
      skip: !sceneId,
    });
    const enable =
      data?.node?.__typename === "Scene"
        ? !!data?.node?.property?.items.find(
            item =>
              item.__typename === "PropertyGroup" &&
              item.fields[0].fieldId === "experimental_core" &&
              item.fields[0].value,
          )
        : false;
    return enable;
  }

  if (type === "published") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isCore, setIsCore] = useState<boolean | undefined>(undefined);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const actualAlias = useMemo(
      () => alias || new URLSearchParams(window.location.search).get("alias") || undefined,
      [alias],
    );
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const f = async () => {
        const url = dataUrl(actualAlias);
        try {
          const res = await fetch(url, {});
          if (res.status >= 300) {
            setIsCore(false);
          }
          const d = (await res.json()) as PublishedData | undefined;
          const enable = !!(d?.property as any)?.experimental?.experimental_core;
          setIsCore(enable);
        } catch (e) {
          setIsCore(false);
        }
      };
      f();
    });
    return isCore;
  }

  return false;
};

function dataUrl(alias?: string): string {
  if (alias && window.REEARTH_CONFIG?.api) {
    return `${window.REEARTH_CONFIG.api}/published_data/${alias}`;
  }
  return "data.json";
}
