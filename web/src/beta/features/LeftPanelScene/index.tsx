import SidePanel from "@reearth/beta/features/SidePanel";
import SidePanelItem from "@reearth/beta/features/SidePanel/SidePanelItem";
import SidePanelCard from "@reearth/beta/features/SidePanelCard";

type Props = {};

const LeftPanelScene: React.FC<Props> = () => {
  return (
    <SidePanel location="left">
      <SidePanelItem>
        <SidePanelCard title={"Outline"}>
          {[...Array(100)].map((_, i) => (
            <div key={i}>scrollable / {i}</div>
          ))}
        </SidePanelCard>
      </SidePanelItem>
    </SidePanel>
  );
};

export default LeftPanelScene;
