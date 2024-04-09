import Text from "@reearth/beta/components/Text";
import BlockWrapper from "@reearth/beta/lib/core/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/beta/lib/core/shared/types";
import type { ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";

const TextBlock: React.FC<BlockProps<InfoboxBlock>> = ({ block, isSelected, ...props }) => {
  const src = block?.property?.default?.text?.value as ValueTypes["string"];

  const evaluatedSrc = useExpressionEval(src);

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      {...props}>
      {evaluatedSrc !== undefined ? (
        <StyledText size="body" customColor>
          {evaluatedSrc}
        </StyledText>
      ) : null}
    </BlockWrapper>
  );
};

export default TextBlock;

const StyledText = styled(Text)`
  word-wrap: break-word;
  min-width: 0;
`;
