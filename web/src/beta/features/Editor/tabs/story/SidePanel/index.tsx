import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import ContentPage from "@reearth/beta/features/Editor/tabs/story/SidePanel/ContentPage";
import { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";

type Props = {
  selectedStory?: StoryFragmentFragment;
  selectedPage?: StoryPageFragmentFragment;
  onPageSelect: (id: string) => void;
  onPageDuplicate: (id: string) => void;
  onPageDelete: (id: string) => void;
  onPageAdd: (isSwipeable: boolean) => void;
  onPageMove: (id: string, targetIndex: number) => void;
};

const SidePanel: React.FC<Props> = ({
  selectedStory,
  selectedPage,
  onPageSelect,
  onPageDuplicate,
  onPageDelete,
  onPageAdd,
  onPageMove,
}) => {
  const t = useT();

  return (
    <SidePanelCommon
      location="left"
      contents={[
        // you can use this when get multiple story feature
        // {
        //   id: "story",
        //   title: t("Story"),
        //   maxHeight: "33%",
        //   children: <ContentStory ... />,
        // },
        {
          id: "page",
          title: t("Page"),
          children: (
            <ContentPage
              storyPages={selectedStory?.pages ?? []}
              selectedPage={selectedPage}
              onPageAdd={onPageAdd}
              onPageSelect={onPageSelect}
              onPageDuplicate={onPageDuplicate}
              onPageDelete={onPageDelete}
              onPageMove={onPageMove}
            />
          ),
        },
      ]}
    />
  );
};

export default SidePanel;
