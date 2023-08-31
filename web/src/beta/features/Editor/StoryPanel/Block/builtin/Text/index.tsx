import { useMemo } from "react";

import Text from "@reearth/beta/components/Text";
import { ValueTypes } from "@reearth/beta/utils/value";

import { getFieldValue } from "../../../utils";
import { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";

export type Props = BlockProps;

const TextBlock: React.FC<Props> = ({ block, isSelected, ...props }) => {
  const text = useMemo(
    () => getFieldValue(block?.property?.items ?? [], "text") as ValueTypes["string"],
    [block?.property?.items],
  );

  return (
    <BlockWrapper
      title={block?.title}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
      {...props}>
      {text && (
        <Text size="body" customColor>
          {text}
        </Text>
      )}
    </BlockWrapper>
  );
};

export default TextBlock;
