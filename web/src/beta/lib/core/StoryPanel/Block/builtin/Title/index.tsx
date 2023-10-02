import { useMemo } from "react";

import Text from "@reearth/beta/components/Text";
import { ValueTypes } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { getFieldValue } from "../../../utils";
import { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";

export type Props = BlockProps;

const TitleBlock: React.FC<Props> = ({ block, isSelected, ...props }) => {
  const t = useT();
  const text = useMemo(
    () => getFieldValue(block?.property?.items ?? [], "title") as ValueTypes["string"],
    [block?.property?.items],
  );

  const color = useMemo(
    () => getFieldValue(block?.property?.items ?? [], "color") as ValueTypes["string"],
    [block?.property?.items],
  );

  return (
    <BlockWrapper
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
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
