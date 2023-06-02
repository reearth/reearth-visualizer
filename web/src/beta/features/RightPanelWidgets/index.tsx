import SidePanel from "@reearth/beta/features/SidePanel";
import SidePanelItem from "@reearth/beta/features/SidePanel/SidePanelItem";
import SidePanelCard from "@reearth/beta/features/SidePanelCard";

type Props = {};

const RightPanelWidgets: React.FC<Props> = () => {
  return (
    <SidePanel location="right">
      <SidePanelItem>
        <SidePanelCard title={"Widget Manager"}>
          {[...Array(100)].map((_, i) => (
            <div key={i}>scrollable / {i}</div>
          ))}
        </SidePanelCard>
      </SidePanelItem>
      <SidePanelItem maxHeight="30%">
        <SidePanelCard title={"Widget Setting"}>
          {[...Array(100)].map((_, i) => (
            <div key={i}>scrollable / {i}</div>
          ))}
        </SidePanelCard>
      </SidePanelItem>
    </SidePanel>
  );
};

export default RightPanelWidgets;
