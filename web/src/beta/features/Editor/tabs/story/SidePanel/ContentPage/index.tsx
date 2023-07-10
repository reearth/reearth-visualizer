import Action from "@reearth/beta/features/Editor/Tabs/story/SidePanel/Action";
import Item from "@reearth/beta/features/Editor/Tabs/story/SidePanel/Item";
import PageItemWrapper from "@reearth/beta/features/Editor/Tabs/story/SidePanel/PageItemWrapper";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  onSelectPage: (id: string) => void;
  onPageAdd: () => void;
};
const ContentPage: React.FC<Props> = ({ onSelectPage, onPageAdd }) => {
  const t = useT();

  return (
    <SContent>
      <SContentUp>
        {[...Array(100)].map((_, i) => (
          <PageItemWrapper key={i} pageCount={i + 1} isSwipable={i % 2 === 0}>
            <Item
              key={i}
              onItemClick={() => onSelectPage(i.toString())}
              onActionClick={() => console.log("onActionClick")}>
              Page
            </Item>
          </PageItemWrapper>
        ))}
      </SContentUp>
      <SContentBottom>
        <Action icon="square" title={`+ ${t("New Page")}`} onClick={onPageAdd} />
        <Action icon="swiper" title={`+ ${t("New Swipe")}`} onClick={onPageAdd} />
      </SContentBottom>
    </SContent>
  );
};

export default ContentPage;

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
