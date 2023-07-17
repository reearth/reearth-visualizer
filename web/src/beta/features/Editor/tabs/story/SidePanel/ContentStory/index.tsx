import Item from "@reearth/beta/features/Editor/tabs/story/SidePanel/Item";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  onSelectStory: (id: string) => void;
  onStoryAdd: () => void;
};
const ContentStory: React.FC<Props> = ({ onSelectStory }) => {
  const t = useT();

  return (
    <SContent>
      <SContentUp>
        <Item
          onItemClick={() => onSelectStory("id")}
          onActionClick={() => console.log("onActionClick")}
          isActive={true}>
          {t("Story")}
        </Item>
      </SContentUp>
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
