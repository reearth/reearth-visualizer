import BlockWrapper from "@reearth/app/features/Visualizer/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/app/features/Visualizer/shared/types";
import type { ValueTypes } from "@reearth/app/utils/value";
import { styled } from "@reearth/services/theme";
import { css } from "@reearth/services/theme/reearthTheme/common";
import { FC, useCallback, useMemo } from "react";

import { InfoboxBlock } from "../../../types";
import useExpressionEval from "../useExpressionEval";

const normalizeUrl = (url: string | undefined): string | undefined => {
  if (!url || typeof url !== "string") return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  const urlWithProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  try {
    const parsed = new URL(urlWithProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return parsed.href;
  } catch {
    return undefined;
  }
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

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

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
          <Link
            href={normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
          >
            {displayText}
          </Link>
        ) : (
          <PlainText>{displayText}</PlainText>
        )
      ) : null}
    </BlockWrapper>
  );
};

export default LinkBlock;

const Link = styled("a")(({ theme }) => ({
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  minWidth: 0,
  wordWrap: css.wordBreak.breakWord,
  color: theme.primary.main,
  textDecoration: css.textDecoration.underline,
  cursor: css.cursor.pointer,
  position: css.position.relative,
  "&:hover": {
    color: theme.primary.strong
  }
}));

const PlainText = styled("div")(({ theme }) => ({
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
  minWidth: 0,
  wordWrap: css.wordBreak.breakWord,
  color: theme.primary.main,
  textDecoration: css.textDecoration.underline
}));
