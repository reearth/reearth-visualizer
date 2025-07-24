import * as Apollo from "@apollo/client";
import {
  GetWorkspacesQuery,
  GetWorkspacesQueryVariables
} from "@reearth/services/gql/__gen__/graphql";
import { GetWorkspacesDocument } from "@reearth/services/gql/queries/teams";

export function useGetWorkspacesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetWorkspacesQuery,
    GetWorkspacesQueryVariables
  >
) {
  const options = { ...baseOptions };
  return Apollo.useQuery<GetWorkspacesQuery, GetWorkspacesQueryVariables>(
    GetWorkspacesDocument,
    options
  );
}
