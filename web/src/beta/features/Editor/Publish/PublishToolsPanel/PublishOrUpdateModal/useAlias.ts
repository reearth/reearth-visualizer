import { generateRandomString } from "@reearth/beta/utils/string";
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
  const currentValidatingAlias = useRef<string>();

  const createAliasCount = useRef(0);
  const createAlias = useCallback(() => {
    createAliasCount.current += 1;
    // Max try 3 times
    if (createAliasCount.current > 3) {
      console.error("Failed to generate unique alias after 3 attempts");
      return;
    }
    const newAlias = generateAlias();
    currentValidatingAlias.current = newAlias;
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
      // Alias is valid if it is provided by data
      !!publishItem.alias ||
        // Validating alias is not in progress
        (!validatingAlias &&
          // Validating alias is the same as the current alias, and avaliable
          !!checkProjectAliasData &&
          currentValidatingAlias.current ===
            checkProjectAliasData.checkProjectAlias.alias &&
          checkProjectAliasData.checkProjectAlias.available)
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
