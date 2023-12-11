import { PublishStatus } from "@reearth/beta/features/Editor/tabs/publish/Nav/PublishModal/hooks";
import { PublishmentStatus } from "@reearth/services/gql/__gen__/graphql";

export const toGqlStatus = (status?: PublishStatus) => {
  return status === "limited"
    ? PublishmentStatus.Limited
    : status == "published"
    ? PublishmentStatus.Public
    : PublishmentStatus.Private;
};
