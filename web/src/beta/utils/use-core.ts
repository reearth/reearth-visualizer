import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetScenePropertyQuery } from "@reearth/classic/gql";

export const useCore = (
  type?: "published" | "earth_editor",
  alias?: string,
): { isCore?: boolean; isGisProject?: boolean; hasError?: boolean } => {
  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  if (query.has("useCore") || type === undefined) {
    return { isCore: query.has("useCore") };
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
              item.fields.find(f => f.fieldId === "experimental_core" && f.value),
          )
        : false;
    return { isCore: enable };
  }

  if (type === "published") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isCore, setIsCore] = useState<boolean | undefined>(undefined);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isGisProject, setIsGisProject] = useState<boolean | undefined>(undefined);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [hasError, setHasError] = useState<boolean | undefined>(undefined);

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
          const d = await res.json();
          if (d.error) {
            setIsCore(false);
            setIsGisProject(false);
          }
          const enable = !!d?.property?.experimental?.experimental_core ?? !!d?.coreSupport;
          const gisProject = !!d?.coreSupport;

          setHasError(d?.error);
          setIsCore(enable);
          setIsGisProject(gisProject);
        } catch (e) {
          setHasError(true);
          setIsCore(false);
          setIsGisProject(false);
        }
      };
      f();
    });

    return { isCore, isGisProject, hasError };
  }

  return { isCore: false, isGisProject: false };
};

function dataUrl(alias?: string): string {
  if (alias && window.REEARTH_CONFIG?.api) {
    return `${window.REEARTH_CONFIG.api}/published_data/${alias}`;
  }
  return "data.json";
}
