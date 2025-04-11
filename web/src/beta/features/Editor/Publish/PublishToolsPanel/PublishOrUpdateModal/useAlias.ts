import { useProjectFetcher } from "@reearth/services/api";
import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    const newAlias = publishItem.alias ?? publishItem.id;
    setAlias(newAlias);
    currentValidatingAlias.current = newAlias;
  }, [publishItem.alias, publishItem.id, checkProjectAlias]);

 useEffect(() => {
   setAliasValid(
     !!(
       publishItem.alias != null ||
       (!validatingAlias &&
         checkProjectAliasData?.checkProjectAlias?.available &&
         currentValidatingAlias.current ===
           checkProjectAliasData.checkProjectAlias.alias)
     )
   );
 }, [validatingAlias, checkProjectAliasData, publishItem.alias]);


  return {
    alias,
    aliasValid
  };
};
