import * as Apollo from '@apollo/client';
import { GetTeamsQuery, GetTeamsQueryVariables } from '@reearth/services/gql/__gen__/graphql';
import { GetTeamsDocument } from '@reearth/services/gql/queries/teams';

export function useGetTeamsQuery(baseOptions?: Apollo.QueryHookOptions<GetTeamsQuery, GetTeamsQueryVariables>) {
    const options = { ...baseOptions }
    return Apollo.useQuery<GetTeamsQuery, GetTeamsQueryVariables>(GetTeamsDocument, options);
}