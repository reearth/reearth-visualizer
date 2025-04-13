import { useProjectFetcher } from "@reearth/services/api";
import { useEffect, useRef, useState } from "react";

import { PublishItem } from "../hooks";

export default ({ publishItem }: { publishItem: PublishItem }) => {
  const { useProjectAliasCheckQuery } = useProjectFetcher();

  const [aliasValid, setAliasValid] = useState(false);
  const [alias, setAlias] = useState<string | undefined>(
    publishItem.alias ? publishItem.alias: publishItem.id
  );
  const currentValidatingAlias = useRef<string>();

  const { checkProjectAlias, loading: validatingAlias } =
    useProjectAliasCheckQuery(alias);

  useEffect(() => {
    const newAlias = publishItem.alias ? publishItem.alias : publishItem.id;
    setAlias(newAlias);
    currentValidatingAlias.current = newAlias;
  }, [publishItem.alias, publishItem.id]);

  useEffect(() => {
    setAliasValid(
      !!(
        publishItem.alias != null ||
        (!validatingAlias )
      )
    );
  }, [
    validatingAlias,
    publishItem.alias,
    checkProjectAlias?.available,
    checkProjectAlias?.alias
  ]);

  return {
    alias,
    aliasValid
  };
};
