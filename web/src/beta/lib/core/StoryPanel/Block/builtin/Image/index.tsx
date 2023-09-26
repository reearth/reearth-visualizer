import { useMemo } from "react";

import type { CommonProps as BlockProps } from "@reearth//beta/lib/core/StoryPanel/Block/types";
import BlockWrapper from "@reearth/beta/lib/core/StoryPanel/Block/builtin/common/Wrapper";
import { getFieldValue } from "@reearth/beta/lib/core/StoryPanel/utils";
import type { ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

const ImageBlock: React.FC<BlockProps> = ({ block, isSelected, ...props }) => {
  const src = useMemo(
    () => getFieldValue(block?.property?.items ?? [], "src") as ValueTypes["string"],
    [block?.property?.items],
  );
  const title = useMemo(() => block?.property?.items?.[1]?.title, [block?.property?.items]);

  return (
    <BlockWrapper
      title={title}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.property?.id}
      propertyItems={block?.property?.items}
      {...props}>
      {src && <Image src={src} />}
    </BlockWrapper>
  );
};

export default ImageBlock;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`;
