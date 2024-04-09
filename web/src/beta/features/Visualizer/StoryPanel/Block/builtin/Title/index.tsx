import { useMemo } from "react";

import Text from "@reearth/beta/components/Text";
import { isEmptyString } from "@reearth/beta/utils/util";
import { ValueTypes } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import BlockWrapper from "../../../../shared/components/BlockWrapper";
import { CommonBlockProps as BlockProps } from "../../../../shared/types";
import { StoryBlock } from "../../../types";

const TitleBlock: React.FC<BlockProps<StoryBlock>> = ({ block, isSelected, ...props }) => {
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

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={property}
      dndEnabled={false}
      {...props}>
      <Title size="h2" hasText={!!title && !hasEmptySpace} color={color} customColor>
        {hasEmptySpace || !title ? t("Untitled") : title}
      </Title>
    </BlockWrapper>
  );
};

export default TitleBlock;

const Title = styled(Text)<{ hasText?: boolean; color?: string }>`
  color: ${({ color, hasText, theme }) => (hasText ? color ?? "black" : theme.content.weak)};
`;
