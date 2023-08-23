import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";

type Props = {
  sceneId?: string;
};

const StoryRightPanel: React.FC<Props> = () => {
  return (
    <SidePanelCommon
      location="right"
      contents={[
        {
          id: "story",
          title: "Story Right Panel",
          //   maxHeight: !selectedWidget ? "100%" : "40%",
          children: <div>Story StoryStoryStoryStory Story Story StoryStoryStoryStoryStory</div>,
        },
      ]}
    />
  );
};

export default StoryRightPanel;
