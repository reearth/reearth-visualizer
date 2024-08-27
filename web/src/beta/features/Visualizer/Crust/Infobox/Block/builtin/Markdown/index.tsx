import { FC, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import { CommonBlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import { ValueTypes } from "@reearth/beta/utils/value";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";

const plugins = [gfm];

const MarkdownBlock: FC<CommonBlockProps<InfoboxBlock>> = ({ block, isSelected, ...props }) => {
  const src = useMemo(
    () => block?.property?.default?.src?.value as ValueTypes["string"],
    [block?.property?.default?.src],
  );

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
        <ReactMarkdown remarkPlugins={plugins} linkTarget="_blank">
          {evaluatedSrc || ""}
        </ReactMarkdown>
      ) : null}
    </BlockWrapper>
  );
};

export default MarkdownBlock;
