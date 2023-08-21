import { ReactNode, useMemo } from "react";

// import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import StorySidePanel from "@reearth/beta/features/Editor/tabs/story/SidePanel";
import { Tab } from "@reearth/beta/features/Navbar";
import { StoryFragmentFragment, StoryPageFragmentFragment } from "@reearth/services/gql";

type Props = {
  tab: Tab;

  // for story tab
  selectedStory?: StoryFragmentFragment;
  selectedPage?: StoryPageFragmentFragment;
  onPageSelect: (id: string) => void;
  onPageDuplicate: (id: string) => void;
  onPageDelete: (id: string) => void;
  onPageAdd: (isSwipeable: boolean) => void;
  onPageMove: (id: string, targetIndex: number) => void;
};

export default ({
  tab,
  selectedStory,
  selectedPage,
  onPageSelect,
  onPageDuplicate,
  onPageDelete,
  onPageAdd,
  onPageMove,
}: Props) => {
  const leftPanel = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "map":
        // return groups.map(({ schemaGroupId, title, fields }) => (
        //   <SidePanelSectionField key={schemaGroupId} title={title}>
        //     <ul>
        //       {fields.map(({ fieldId, title }) => (
        //         <li key={fieldId}>{title}</li>
        //       ))}
        //     </ul>
        //   </SidePanelSectionField>
        // ));
        return <div>Left panel</div>;
      case "story":
        return (
          <StorySidePanel
            selectedStory={selectedStory}
            selectedPage={selectedPage}
            onPageSelect={onPageSelect}
            onPageDuplicate={onPageDuplicate}
            onPageDelete={onPageDelete}
            onPageAdd={onPageAdd}
            onPageMove={onPageMove}
          />
        );
      case "widgets":
      case "publish":
      default:
        return undefined;
    }
  }, [
    onPageAdd,
    onPageDelete,
    onPageDuplicate,
    onPageMove,
    onPageSelect,
    selectedPage,
    selectedStory,
    tab,
  ]);

  return {
    leftPanel,
  };
};
