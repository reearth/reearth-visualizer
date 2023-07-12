import Action from "@reearth/beta/features/Editor/tabs/story/SidePanel/Action";
import Item from "@reearth/beta/features/Editor/tabs/story/SidePanel/Item";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  onSelectStory: (id: string) => void;
  onStoryAdd: () => void;
};
const ContentStory: React.FC<Props> = ({ onStoryAdd, onSelectStory }) => {
  const t = useT();

  return (
    <SContent>
      <SContentUp>
        {[...Array(100)].map((_, i) => (
          <Item
            key={i}
            onItemClick={() => onSelectStory(i.toString())}
            onActionClick={() => console.log("onActionClick")}>
            Story{i} / Story{i} / Story{i} / Story{i} / Story{i} / Story{i} / Story{i} / Story{i} /
            Story{i}
          </Item>
        ))}
      </SContentUp>
      <SContentBottom>
        <Action
          icon="book"
          iconColor="#ffffff"
          iconSize={16}
          title={`+ ${t("New Story")}`}
          onClick={onStoryAdd}
        />
      </SContentBottom>
    </SContent>
  );
};

export default ContentStory;

const SContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const SContentUp = styled.div`
  flex-grow: 1;
  height: 0;
  overflow-y: auto;
  ::-webkit-scrollbar {
    display: none;
  }

  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
`;

const SContentBottom = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
`;
