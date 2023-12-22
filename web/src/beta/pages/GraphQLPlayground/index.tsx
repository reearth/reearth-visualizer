import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { GraphiQL } from "graphiql";
import { useEffect, useState } from "react";

import Filled from "@reearth/beta/components/Filled";
import Text from "@reearth/beta/components/Text";
import { useAuth } from "@reearth/services/auth";

const fetcher = createGraphiQLFetcher({
  url: `${window.REEARTH_CONFIG?.api || "/api"}/graphql`,
});

export default function GraphQLPlayground(_: { path?: string }): JSX.Element {
  const { getAccessToken } = useAuth();
  const [headers, setHeaders] = useState<string>();
  useEffect(() => {
    getAccessToken().then(a => {
      setHeaders(JSON.stringify({ Authorization: `Bearer ${a}` }, null, 2));
    });
  }, [getAccessToken]);

  return headers ? (
    <Filled>
      <GraphiQL fetcher={fetcher} isHeadersEditorEnabled headers={headers} />
    </Filled>
  ) : (
    <Text size="h2">Please log in to Re:Earth</Text>
  );
}
