import React from "react";

import Wrapper from "../InfoBoxFrame";
import BlockComponent, { InfoboxProperty, Block as BlockType } from "../SimpleInfoboxBlock";

export type Block = BlockType;

export type Props = {
  className?: string;
  infoboxKey?: string;
  property?: InfoboxProperty;
  blocks?: Block[];
  name?: string;
  visible?: boolean;
};

const SimpleInfoBox: React.FC<Props> = ({
  className,
  infoboxKey,
  property,
  blocks,
  name,
  visible,
}) => {
  return (
    <Wrapper
      className={className}
      infoboxKey={infoboxKey}
      title={property?.default?.title || name}
      size={property?.default?.size}
      visible={visible}
      noContent={!blocks?.length}
      styles={property?.default}>
      {blocks?.map(b => (
        <BlockComponent key={b.id} block={b} infoboxProperty={property} />
      ))}
    </Wrapper>
  );
};

export default SimpleInfoBox;
