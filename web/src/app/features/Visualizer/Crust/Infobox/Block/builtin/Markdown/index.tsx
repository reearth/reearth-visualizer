import BlockWrapper from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import { CommonBlockProps } from "@reearth/app/features/Visualizer/shared/types";
import { ValueTypes } from "@reearth/app/utils/value";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";

import "github-markdown-css";

const plugins = [gfm];

const MarkdownBlock: FC<CommonBlockProps<InfoboxBlock>> = ({
  block,
  layer,
  isSelected,
  selectedFeature,
  ...props
}) => {
  const src = useMemo(
    () => block?.property?.default?.src?.value as ValueTypes["string"],
    [block?.property?.default?.src]
  );

  const evaluatedSrc = useExpressionEval(src);
  const propertyNames = useMemo(() => {
    if (!selectedFeature?.properties) return [];
    const defaultProperty = ["extrudedHeight", "id", "positions", "type"];
    return Object.keys(selectedFeature.properties).filter(
      (key) => !defaultProperty.includes(key)
    );
  }, [selectedFeature]);

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
          <MarkdownWrapper className="markdown-body">
            <ReactMarkdown
              remarkPlugins={plugins}
              components={{ a: LinkRenderer }}
            >
              {evaluatedSrc || ""}
            </ReactMarkdown>
          </MarkdownWrapper>
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

const MarkdownWrapper = styled("div")(() => ({
  "@media (prefers-color-scheme: dark)": {
    all: "unset"
  },
  "& ul": {
    listStyleType: "initial"
  },
  "& ol": {
    listStyleType: "decimal"
  }
}));
