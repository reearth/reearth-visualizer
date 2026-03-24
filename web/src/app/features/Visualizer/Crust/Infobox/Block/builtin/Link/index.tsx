import BlockWrapper from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/app/features/Visualizer/shared/types";
import type { ValueTypes } from "@reearth/app/utils/value";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useMemo } from "react";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";

const normalizeUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

const LinkBlock: FC<BlockProps<InfoboxBlock>> = ({
  block,
  layer,
  isSelected,
  selectedFeature,
  ...props
}) => {
  const text = block?.property?.default?.text?.value as ValueTypes["string"];
  const url = block?.property?.default?.url?.value as ValueTypes["string"];

  const evaluatedText = useExpressionEval(text);
  const evaluatedUrl = useExpressionEval(url);

  const normalizedUrl = useMemo(
    () => normalizeUrl(evaluatedUrl),
    [evaluatedUrl]
  );

  const propertyNames = Object.keys(selectedFeature?.properties ?? {}).filter(
    (key) => {
      const defaultProperty = ["extrudedHeight", "id", "positions", "type"];
      return !defaultProperty.includes(key);
    }
  );

  const displayText = evaluatedText || evaluatedUrl;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (normalizedUrl) {
        window.open(normalizedUrl, "_blank", "noopener,noreferrer");
      }
    },
    [normalizedUrl]
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
      {displayText !== undefined ? (
        normalizedUrl ? (
          <Link onClick={handleClick}>{displayText}</Link>
        ) : (
          <PlainText>{displayText}</PlainText>
        )
      ) : null}
    </BlockWrapper>
  );
};

export default LinkBlock;

const Link = styled("span")(({ theme }) => ({
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  minWidth: 0,
  wordWrap: "break-word",
  color: "#0066cc",
  textDecoration: "underline",
  cursor: "pointer",
  position: "relative",
  zIndex: 1,
  "&:hover": {
    color: "#004499"
  }
}));

const PlainText = styled("div")(({ theme }) => ({
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  minWidth: 0,
  wordWrap: "break-word",
  color: "#0066cc",
  textDecoration: "underline"
}));
