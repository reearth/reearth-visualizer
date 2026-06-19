# GraphQL

GraphQL queries, mutations, fragments, and generated types.

## Structure

- `queries/` - Query and mutation definitions
- `fragments/` - Reusable GraphQL fragments
- `__gen__/` - Auto-generated types (DO NOT EDIT)
- `provider/` - Apollo Client setup

## Usage

1. Define query/mutation in `queries/*.ts`
2. Run `yarn gql` to generate types
3. Use via API hooks in `services/api/`

```typescript
// 1. Define in gql/queries/layer.ts
export const ADD_LAYER = gql(`mutation AddLayer($input: AddLayerInput!) { ... }`);

// 2. Use in services/api/layer/useLayerMutations.ts
import { ADD_LAYER } from "@reearth/services/gql/queries/layer";
const [mutation] = useMutation(ADD_LAYER);

// 3. Import in features
import { useLayerMutations } from "@reearth/services/api/layer";
```

## Code Generation

```bash
yarn gql
```

Regenerate types after schema changes. Never edit `__gen__/` files manually.
