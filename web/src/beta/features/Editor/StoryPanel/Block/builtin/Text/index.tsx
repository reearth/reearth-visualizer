import { useMemo } from "react";

import Text from "@reearth/beta/components/Text";

import { CommonProps as BlockProps } from "../../types";
import BlockWrapper from "../common/Wrapper";
import { getFieldValue } from "../utils";

export type Props = BlockProps;

const TextBlock: React.FC<Props> = ({ block, isSelected, onClick, onRemove }) => {
  const text = useMemo(
    () => getFieldValue("text", block?.property?.items),
    [block?.property?.items],
  );
  return (
    <BlockWrapper
      title={block?.title}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
      onClick={onClick}
      onRemove={onRemove}>
      {text && <Text size="body">{text}</Text>}
    </BlockWrapper>
  );
};

export default TextBlock;
