import { useMemo } from "react";

import StoryBlock from "@reearth/beta/features/Editor/StoryPanel/Block";
import { Item } from "@reearth/services/api/propertyApi/utils";
import { styled } from "@reearth/services/theme";

type Props = {
  sceneId?: string;
  storyId?: string;
  pageId?: string;
  propertyId?: string;
  propertyItems?: Item[];
  onBlockSelect?: (blockId?: string) => void;
};

const StoryPage: React.FC<Props> = ({ pageId, propertyId, propertyItems }) => {
  const titleProperty = useMemo(
    () => propertyItems?.find(i => i.schemaGroup === "title"),
    [propertyItems],
  );

  const titleId = `${pageId}/title`;
  return (
    <Wrapper id={pageId}>
      {titleProperty && (
        <StoryBlock
          block={{
            id: titleId,
            pluginId: "reearth",
            extensionId: "titleStoryBlock",
            title: titleProperty.title,
            property: {
              id: propertyId ?? "",
              items: [titleProperty],
            },
          }}
        />
      )}
    </Wrapper>
  );
};

export default StoryPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.content.weaker};
  padding: 20px;
  box-sizing: border-box;
`;
