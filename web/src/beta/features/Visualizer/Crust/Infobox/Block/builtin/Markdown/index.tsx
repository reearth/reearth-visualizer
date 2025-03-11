import BlockWrapper from "@reearth/beta/features/Visualizer/shared/components/BlockWrapper";
import { CommonBlockProps } from "@reearth/beta/features/Visualizer/shared/types";
import { ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";

const plugins = [gfm];

const MarkdownBlock: FC<CommonBlockProps<InfoboxBlock>> = ({
  block,
  layer,
  isSelected,
  selectedFuture,
  ...props
}) => {
  const src = useMemo(
    () => block?.property?.default?.src?.value as ValueTypes["string"],
    [block?.property?.default?.src]
  );

  const evaluatedSrc = useExpressionEval(src);
  const propertyNames = Object.keys(selectedFuture?.properties).filter(
    (key) => {
      const defaultProperty = ["extrudedHeight", "id", "positions", "type"];
      return !defaultProperty.includes(key);
    }
  );
  const LinkRenderer = ({
    href,
    children
  }: {
    href?: string;
    children?: ReactNode;
  }) => (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      propertyNames={propertyNames}
      {...props}
    >
      {evaluatedSrc !== undefined ? (
        <Wrapper>
          <ReactMarkdown
            remarkPlugins={plugins}
            components={{ a: LinkRenderer }}
          >
            {evaluatedSrc || ""}
          </ReactMarkdown>
        </Wrapper>
      ) : null}
    </BlockWrapper>
  );
};

export default MarkdownBlock;

const Wrapper = styled("div")(() => ({
  width: "100%",
  position: "relative",
  ["*"]: {
    maxWidth: "100%",
    height: "auto"
  }
}));
