import { GetAssetsQuery } from "@reearth/services/gql";

export type AssetNodes = NonNullable<
  GetAssetsQuery["assets"]["nodes"][number]
>[];
