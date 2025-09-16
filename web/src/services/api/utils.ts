import { PublishmentStatus } from "@reearth/services/gql/__gen__/graphql";

export type PublishStatus = "published" | "limited" | "unpublished";

export const toGqlStatus = (status?: PublishStatus) => {
  return status === "limited"
    ? PublishmentStatus.Limited
    : status == "published"
      ? PublishmentStatus.Public
      : PublishmentStatus.Private;
};

export const toPublishmentStatus = (s?: PublishmentStatus) => {
  switch (s) {
    case PublishmentStatus.Public:
      return "published";
    case PublishmentStatus.Limited:
      return "limited";
    default:
      return "unpublished";
  }
};
