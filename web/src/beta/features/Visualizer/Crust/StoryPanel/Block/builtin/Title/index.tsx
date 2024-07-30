import { FC, useMemo } from "react";

import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import { CommonBlockProps as BlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import { Typography } from "@reearth/beta/lib/reearth-ui";
import { isEmptyString } from "@reearth/beta/utils/util";
import { ValueTypes } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

import { StoryBlock } from "../../../types";

const TitleBlock: FC<BlockProps<StoryBlock>> = ({ block, isSelected, ...props }) => {
  const t = useT();

  const property = useMemo(() => block?.property, [block?.property]);

  const title = useMemo(
    () => property?.title?.title?.value as ValueTypes["string"],
    [property?.title?.title?.value],
  );

  const color = useMemo(
    () => property?.title?.color?.value as ValueTypes["string"],
    [property?.title?.color?.value],
  );

  const hasEmptySpace = useMemo(() => isEmptyString(title), [title]);
  const hasText = !!title && !hasEmptySpace;
  const theme = useTheme();

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={property}
      dndEnabled={false}
      {...props}>
      <Typography size="h2" color={hasText ? color ?? "black" : theme.content.weak}>
        {hasEmptySpace || !title ? t("Untitled") : title}
      </Typography>
    </BlockWrapper>
  );
};

export default TitleBlock;
