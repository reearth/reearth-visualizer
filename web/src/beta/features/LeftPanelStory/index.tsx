import SidePanel from "@reearth/beta/features/SidePanel";
import SidePanelItem from "@reearth/beta/features/SidePanel/SidePanelItem";
import SidePanelCard from "@reearth/beta/features/SidePanelCard";

type Props = {};

const LeftPanelStory: React.FC<Props> = () => {
  return (
    <SidePanel>
      <SidePanelItem>
        <SidePanelCard title={"Inspector"}>
          {[...Array(100)].map((_, i) => (
            <div key={i}>scrollable / {i}</div>
          ))}
        </SidePanelCard>
      </SidePanelItem>
    </SidePanel>
  );
};

export default LeftPanelStory;
