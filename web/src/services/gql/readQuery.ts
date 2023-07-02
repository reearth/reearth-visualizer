import { useApolloClient } from "@apollo/client";
import { DocumentNode } from "graphql";

export default (query: DocumentNode, variables: unknown) => {
  const client = useApolloClient();

  return client.readQuery({
    query,
    variables,
  });
};
