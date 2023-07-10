import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import ContentPage from "@reearth/beta/features/Editor/tabs/story/SidePanel/ContentPage";
import ContentStory from "@reearth/beta/features/Editor/tabs/story/SidePanel/ContentStory";
import { useT } from "@reearth/services/i18n";

// TODO: these are currently rough definition
type Props = {
  stories: any;
  selectedStory: any;
  onSelectStory: (id: string) => void;
  onStoryAdd: () => void;
  selectedPageId?: string;
  onSelectPage: (id: string) => void;
  onPageAdd: () => void;
};

const SidePanel: React.FC<Props> = ({ onStoryAdd, onSelectStory, onPageAdd, onSelectPage }) => {
  const t = useT();

  return (
    <SidePanelCommon
      location="left"
      contents={[
        {
          id: "story",
          title: t("Story"),
          maxHeight: "33%",
          children: <ContentStory onSelectStory={onSelectStory} onStoryAdd={onStoryAdd} />,
        },
        {
          id: "page",
          title: t("Page"),
          children: <ContentPage onPageAdd={onPageAdd} onSelectPage={onSelectPage} />,
        },
      ]}
    />
  );
};

export default SidePanel;
