import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";

type Props = {
  sceneId?: string;
};

const MapRightPanel: React.FC<Props> = () => {
  return (
    <SidePanelCommon
      location="right"
      contents={[
        {
          id: "map",
          title: "Map Right Panel",
          //   maxHeight: !selectedWidget ? "100%" : "40%",
          children: (
            <div>
              Map Right Panel contentMap Right Panel contentMap Right Panel contentMap Right Panel
              content
            </div>
          ),
        },
      ]}
    />
  );
};

export default MapRightPanel;
