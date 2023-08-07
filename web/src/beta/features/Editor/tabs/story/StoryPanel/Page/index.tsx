import { Fragment, useCallback, useState } from "react";

import { InstallableStoryBlock } from "@reearth/services/api/storytellingApi/blocks";
import { styled } from "@reearth/services/theme";

import BlockAddBar from "./BlockAddBar";

type StoryBlock = {
  id: string;
  type: string;
};

type Props = {
  content?: string;
  blocks?: StoryBlock[];
  installableStoryBlocks?: InstallableStoryBlock[];
};

const StoryPage: React.FC<Props> = ({ content, blocks, installableStoryBlocks }) => {
  const [openBlocks, setOpenBlocks] = useState(false);

  const handleBlockOpen = useCallback(() => {
    setOpenBlocks(o => !o);
  }, []);

  const handleBlockAdd = useCallback((id: string) => {
    console.log("ADDDDD BLOCK w ID: ", id);
  }, []);

  return (
    <Wrapper>
      <p>Page ID</p>
      <p>{content}</p>
      {blocks ? (
        blocks.map((_, idx) => (
          <Fragment key={idx}>
            <Block>{idx}</Block>
            <BlockAddBar
              openBlocks={openBlocks}
              installableStoryBlocks={installableStoryBlocks}
              onBlockOpen={handleBlockOpen}
              onBlockAdd={handleBlockAdd}
            />
          </Fragment>
        ))
      ) : (
        <BlockAddBar
          openBlocks={openBlocks}
          installableStoryBlocks={installableStoryBlocks}
          onBlockOpen={handleBlockOpen}
          onBlockAdd={handleBlockAdd}
        />
      )}
    </Wrapper>
  );
};

export default StoryPage;

const Wrapper = styled.div`
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
`;

const Block = styled.div`
  padding: 5px;
  height: 50px;
  background: yellow;
`;
