import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import {
  AppearanceAddProps,
  AppearanceNameUpdateProps,
} from "@reearth/beta/features/Editor/useAppearances";
import { NLSAppearance } from "@reearth/services/api/appearanceApi/utils";
import { useT } from "@reearth/services/i18n";

import Appearances from "./appearance";

type Props = {
  appearances: NLSAppearance[];
  selectedAppearanceId?: string;
  onAppearanceAdd: (inp: AppearanceAddProps) => void;
  onAppearanceDelete: (id: string) => void;
  onAppearanceNameUpdate: (inp: AppearanceNameUpdateProps) => void;
  onAppearanceSelect: (id: string) => void;
};

const MapSidePanel: React.FC<Props> = ({
  appearances,
  selectedAppearanceId,
  onAppearanceAdd,
  onAppearanceDelete,
  onAppearanceNameUpdate,
  onAppearanceSelect,
}) => {
  const t = useT();

  return (
    <SidePanelCommon
      location="bottom"
      contents={[
        {
          id: "appearance",
          title: t("Appearance"),
          children: (
            <Appearances
              appearances={appearances}
              selectedAppearanceId={selectedAppearanceId}
              onAppearanceAdd={onAppearanceAdd}
              onAppearanceDelete={onAppearanceDelete}
              onAppearanceNameUpdate={onAppearanceNameUpdate}
              onAppearanceSelect={onAppearanceSelect}
            />
          ),
        },
      ]}
    />
  );
};

export default MapSidePanel;
