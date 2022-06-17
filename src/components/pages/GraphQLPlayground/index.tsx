import { createGraphiQLFetcher } from "@graphiql/toolkit";
import GraphiQL from "graphiql";
import { useEffect, useState } from "react";
import "graphiql/graphiql.min.css";

import { useAuth } from "@reearth/auth";
import Filled from "@reearth/components/atoms/Filled";

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
      <GraphiQL fetcher={fetcher} headerEditorEnabled headers={headers} />
    </Filled>
  ) : (
    <div>Please log in to Re:Earth</div>
  );
}
