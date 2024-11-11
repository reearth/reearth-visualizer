import generateRandomString from "@reearth/beta/utils/generate-random-string";
import { useProjectFetcher } from "@reearth/services/api";
import { useCallback, useEffect, useRef, useState } from "react";

import { PublishItem } from "../hooks";

export default ({ publishItem }: { publishItem: PublishItem }) => {
  const { useProjectAliasCheckLazyQuery } = useProjectFetcher();

  const [
    checkProjectAlias,
    { loading: validatingAlias, data: checkProjectAliasData }
  ] = useProjectAliasCheckLazyQuery();

  const [aliasValid, setAliasValid] = useState(false);
  const [alias, setAlias] = useState<string | undefined>(publishItem.alias);

  const createAliasCount = useRef(0);
  const createAlias = useCallback(() => {
    createAliasCount.current += 1;
    // Max try 3 times
    if (createAliasCount.current > 3) {
      return;
    }
    const newAlias = generateAlias();
    setAlias(newAlias);
    checkProjectAlias({ variables: { alias: newAlias } });
  }, [checkProjectAlias]);

  useEffect(() => {
    if (!publishItem.alias) {
      createAlias();
    }
  }, [publishItem.alias, createAlias]);

  useEffect(() => {
    if (
      checkProjectAliasData &&
      !checkProjectAliasData.checkProjectAlias.available
    ) {
      createAlias();
    }
  }, [checkProjectAliasData, createAlias]);

  useEffect(() => {
    setAliasValid(
      !!publishItem.alias ||
        (!validatingAlias &&
          !!checkProjectAliasData &&
          (publishItem.alias ===
            checkProjectAliasData.checkProjectAlias.alias ||
            checkProjectAliasData.checkProjectAlias.available))
    );
  }, [validatingAlias, checkProjectAliasData, publishItem, publishItem.alias]);

  return {
    alias,
    aliasValid
  };
};

function generateAlias() {
  return generateRandomString(10);
}
