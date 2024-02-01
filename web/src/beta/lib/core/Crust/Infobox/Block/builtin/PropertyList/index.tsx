// import { useMemo } from "react";

// import Text from "@reearth/beta/components/Text";
import { useEffect, useMemo } from "react";

import BlockWrapper from "@reearth/beta/lib/core/shared/components/BlockWrapper";
import type { CommonBlockProps as BlockProps } from "@reearth/beta/lib/core/shared/types";
// import type { ValueTypes } from "@reearth/beta/utils/value";
// import { styled } from "@reearth/services/theme";

import { useVisualizer } from "@reearth/beta/lib/core/Visualizer";

import { InfoboxBlock } from "../../../types";

const PropertyList: React.FC<BlockProps<InfoboxBlock>> = ({ block, isSelected, ...props }) => {
  const visualizer = useVisualizer();

  const layers = useMemo(() => visualizer?.current?.layers, [visualizer]);

  useEffect(() => {
    console.log("VVV", layers?.selectedLayer());
  }, [layers]);
  // const src = useMemo(
  //   () => block?.property?.default?.src?.value as ValueTypes["string"],
  //   [block?.property?.default?.src],
  // );
  // console.log(block);

  return (
    <BlockWrapper
      name={block?.name}
      icon={block?.extensionId}
      isSelected={isSelected}
      propertyId={block?.propertyId}
      property={block?.property}
      {...props}>
      {/* alsfjklaksdjf */}
      {/* {src && (
        <StyledText size="body" customColor>
          {src}
        </StyledText>
      )} */}
    </BlockWrapper>
  );
};

export default PropertyList;

// const StyledText = styled(Text)`
//   word-wrap: break-word;
//   min-width: 0;
// `;
