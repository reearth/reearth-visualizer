import { useEffect, useMemo, useState } from "react";

import Text from "@reearth/beta/components/Text";
import { Feature } from "@reearth/beta/lib/core/mantle";
import { evalExpression } from "@reearth/beta/lib/core/mantle/evaluator/simple";
import BlockWrapper from "@reearth/beta/lib/core/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/beta/lib/core/shared/types";
import { useVisualizer } from "@reearth/beta/lib/core/Visualizer";
import type { ValueTypes } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import { InfoboxBlock } from "../../../types";

const TextBlock: React.FC<BlockProps<InfoboxBlock>> = ({ block, isSelected, ...props }) => {
  const [isReady, setIsReady] = useState(false);
  const [evaluatedSrc, setEvaluatedSrc] = useState<string | undefined>(undefined);

  const visualizer = useVisualizer();

  const src = useMemo(
    () => block?.property?.default?.text?.value as ValueTypes["string"],
    [block?.property?.default?.text],
  );

  useEffect(() => {
    if (!isReady) {
      setIsReady(true);
      return;
    }

    const selectedFeature = visualizer.current?.layers.selectedFeature();
    if (selectedFeature && !evaluatedSrc) {
      const simpleFeature: Feature = {
        id: selectedFeature.id,
        type: "feature",
        geometry: selectedFeature.geometry,
        interval: selectedFeature.interval,
        properties: selectedFeature.properties,
        metaData: selectedFeature.metaData,
        range: selectedFeature.range,
      };
      const es = evalExpression(
        {
          expression: src,
        },
        undefined,
        simpleFeature,
      );
      if ((es && typeof es === "string") || typeof es === "number" || typeof es === "boolean") {
        setEvaluatedSrc(es.toString());
      }
    }
  }, [isReady, visualizer, evaluatedSrc, src]);

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      {...props}>
      {src && (
        <StyledText size="body" customColor>
          {evaluatedSrc}
        </StyledText>
      )}
    </BlockWrapper>
  );
};

export default TextBlock;

const StyledText = styled(Text)`
  word-wrap: break-word;
  min-width: 0;
`;
