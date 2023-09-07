import Visualizer from "@reearth/beta/features/Editor/Visualizer";

import StoryPanel from "../Editor/StoryPanel";
import useStorytelling from "../Editor/useStorytelling";

interface IStoryProps {
  selectedProjectType: string;
}
export const StoryPublished = ({ selectedProjectType }: IStoryProps) => {
  const sceneJson = localStorage.getItem("storyData");
  const scene = sceneJson !== null && JSON.parse(sceneJson);

  const { id: sceneId, stories } = scene;
  const { selectedStory, selectedPage, handlePageSelect } = useStorytelling({
    sceneId,
    stories,
  });

  return (
    <Visualizer sceneId={sceneId}>
      {selectedProjectType === "story" && (
        <StoryPanel
          sceneId={sceneId}
          selectedStory={selectedStory}
          currentPage={selectedPage}
          onPageSelect={handlePageSelect}
        />
      )}
    </Visualizer>
  );
};
