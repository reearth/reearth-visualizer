import React from "react";
import { styled } from "@reearth/theme";

// Components
import PluginBlock, {
  InfoboxProperty as InfoboxPropertyType,
} from "@reearth/components/molecules/Common/plugin/PluginBlock";

// Types
export type InfoboxProperty = InfoboxPropertyType;

export interface Block {
  id: string;
  pluginId: string;
  extensionId: string;
  propertyId?: string;
  property?: { [key: string]: any };
  pluginProperty?: { [key: string]: any };
  isLinked?: boolean;
}

export interface Props {
  block?: Block;
  infoboxProperty?: InfoboxProperty;
}

// TODO: InfoboxBlock とコンポーネントを共通化したい
const SimpleInfoboxBlock: React.FC<Props> = ({ block, infoboxProperty }) => {
  return !block ? null : (
    <Wrapper>
      <BlockWrapper>
        <PluginBlock {...block} infoboxProperty={infoboxProperty} isBuilt />
      </BlockWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  margin: 0;
  padding: 10px 0;
  border-radius: 6px;
`;

const BlockWrapper = styled.div`
  position: relative;
  box-sizing: border-box;
`;

export default SimpleInfoboxBlock;
