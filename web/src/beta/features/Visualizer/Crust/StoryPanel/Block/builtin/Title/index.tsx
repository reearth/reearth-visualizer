import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import { CommonBlockProps as BlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import { isEmptyString } from "@reearth/beta/utils/string";
import { ValueTypes } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import { FC, useMemo } from "react";

import { StoryBlock } from "../../../types";

const TitleBlock: FC<BlockProps<StoryBlock>> = ({
  block,
  isSelected,
  ...props
}) => {
  const t = useT();

  const property = useMemo(() => block?.property, [block?.property]);

  const title = useMemo(
    () => property?.title?.title?.value as ValueTypes["string"],
    [property?.title?.title?.value]
  );

  const color = useMemo(
    () => property?.title?.color?.value as ValueTypes["string"],
    [property?.title?.color?.value]
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
      {...props}
    >
      <TitleWrapper color={hasText ? (color ?? "black") : theme.content.weak}>
        {hasEmptySpace || !title ? t("Untitled") : title}
      </TitleWrapper>
    </BlockWrapper>
  );
};

export default TitleBlock;

const TitleWrapper = styled("div")<{ color?: string }>(({ color, theme }) => ({
  color: color,
  fontSize: theme.fonts.sizes.h2,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-word"
}));
