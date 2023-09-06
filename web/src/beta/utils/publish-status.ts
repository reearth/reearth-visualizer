export const getPublishStatus = (publishStatus, publishStoryStatus, isStoryTabSelected, t) => {
  const isPublishStory = publishStoryStatus === "limited" || publishStoryStatus === "published";
  const isPublishProject = publishStatus === "limited" || publishStatus === "published";

  const checkPublished = isPublishProject ? t("Update") : t("Publish");

  const checkStoryPublished = isPublishStory ? t("Update") : t("Publish");

  const publishedName = isStoryTabSelected ? checkStoryPublished : checkPublished;

  const disablePublish = isStoryTabSelected
    ? publishStoryStatus === "unpublished"
    : publishStatus === "unpublished";

  const publishText = isStoryTabSelected
    ? isPublishStory
      ? t("Published")
      : t("Unpublished")
    : isPublishProject
    ? t("Published")
    : t("Unpublished");

  return {
    publishedName,
    disablePublish,
    publishText,
  };
};
