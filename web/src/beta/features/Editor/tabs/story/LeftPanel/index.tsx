import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import ContentPage from "@reearth/beta/features/Editor/tabs/story/LeftPanel/ContentPage";
import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import type { Story } from "@reearth/services/api/storytellingApi/utils";
import { useT } from "@reearth/services/i18n";

type Props = {
  selectedStory?: Story;
  selectedPageId?: string;
  onPageSelect: (id: string) => void;
  onPageDuplicate: (id: string) => void;
  onPageDelete: (id: string) => void;
  onPageAdd: (isSwipeable: boolean) => void;
  onPageMove: (id: string, targetIndex: number) => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
};

const StoryLeftPanel: React.FC<Props> = ({
  selectedStory,
  selectedPageId,
  onPageSelect,
  onPageDuplicate,
  onPageDelete,
  onPageAdd,
  onPageMove,
  onPropertyUpdate,
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
              selectedPageId={selectedPageId}
              onPageAdd={onPageAdd}
              onPageSelect={onPageSelect}
              onPageDuplicate={onPageDuplicate}
              onPageDelete={onPageDelete}
              onPageMove={onPageMove}
              onPropertyUpdate={onPropertyUpdate}
            />
          ),
        },
      ]}
    />
  );
};

export default StoryLeftPanel;
