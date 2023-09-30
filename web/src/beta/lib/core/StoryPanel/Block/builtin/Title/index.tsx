import { useMemo } from "react";

import Text from "@reearth/beta/components/Text";
import { ValueTypes } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";

export type Props = BlockProps;

const TitleBlock: React.FC<Props> = ({ block, isSelected, ...props }) => {
  const t = useT();
  const text = useMemo(
    () => block?.property?.title as ValueTypes["string"],
    [block?.property?.title],
  );

  const color = useMemo(
    () => block?.property?.color as ValueTypes["string"],
    [block?.property?.color],
  );

  return (
    <BlockWrapper
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      property={block?.property}
      dndEnabled={false}
      {...props}>
      <Title size="h2" hasText={!!text} color={color} customColor>
        {text ?? t("Untitled")}
      </Title>
    </BlockWrapper>
  );
};

export default TitleBlock;

const Title = styled(Text)<{ hasText?: boolean; color?: string }>`
  color: ${({ color, hasText, theme }) => (hasText ? color ?? "black" : theme.content.weak)};
`;
