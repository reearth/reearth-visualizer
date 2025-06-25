import { createGraphiQLFetcher } from "@graphiql/toolkit";
import { Typography } from "@reearth/app/lib/reearth-ui";
import { useAuth } from "@reearth/services/auth";
import { styled } from "@reearth/services/theme";
import { GraphiQL } from "graphiql";
import { useEffect, useState } from "react";
import "graphiql/graphiql.css";

const fetcher = createGraphiQLFetcher({
  url: `${window.REEARTH_CONFIG?.api || "/api"}` + "/graphql"
});

export default function GraphQLPlayground(_: { path?: string }): JSX.Element {
  const { getAccessToken } = useAuth();
  const [headers, setHeaders] = useState<string>();
  useEffect(() => {
    getAccessToken().then((a) => {
      setHeaders(JSON.stringify({ Authorization: `Bearer ${a}` }, null, 2));
    });
  }, [getAccessToken]);

  return headers ? (
    <Filled>
      <GraphiQL fetcher={fetcher} isHeadersEditorEnabled headers={headers} />
    </Filled>
  ) : (
    <Typography size="h2">Please log in to Re:Earth</Typography>
  );
}

const Filled = styled("div")(() => ({
  width: "100%",
  height: "100%",
  position: "relative",
  overflow: "hidden"
}));
