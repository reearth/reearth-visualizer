// import ListItem from "@reearth/beta/components/ListItem";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import type { LayerUpdateProps } from "@reearth/beta/features/Editor/useLayers";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Layers from "../Layers";

type GroupSectionFieldProps = {
  layers: NLSLayer[];
  selectedLayerId?: string;
  selectedSceneSetting?: boolean;
  onLayerDelete: (id: string) => void;
  onLayerUpdate: (inp: LayerUpdateProps) => void;
  onLayerSelect: (id: string) => void;
  onSceneSettingSelect: () => void;
  onDataSourceManagerOpen: () => void;
};

const GroupSectionField: React.FC<GroupSectionFieldProps> = ({
  layers,
  selectedLayerId,
  // selectedSceneSetting,
  onLayerDelete,
  onLayerUpdate,
  onLayerSelect,
  // onSceneSettingSelect,
  onDataSourceManagerOpen,
}) => {
  const t = useT();

  return (
    <>
      {/* <StyledSidePanelSectionField title={t("Scene")}> */}
      {/* {groups.map(({ schemaGroupId, title }) => (
          <GroupSectionFieldText key={schemaGroupId} size="footnote">
            {title}
          </GroupSectionFieldText>
        ))} */}
      {/* <ListItem isSelected={selectedSceneSetting} onItemClick={onSceneSettingSelect}>
          {t("Main")}
        </ListItem>
      </StyledSidePanelSectionField> */}
      <StyledSidePanelSectionField title={t("Layers")}>
        <Layers
          layers={layers}
          selectedLayerId={selectedLayerId}
          onLayerDelete={onLayerDelete}
          onLayerUpdate={onLayerUpdate}
          onLayerSelect={onLayerSelect}
          onDataSourceManagerOpen={onDataSourceManagerOpen}
        />
      </StyledSidePanelSectionField>
    </>
  );
};

const StyledSidePanelSectionField = styled(SidePanelSectionField)`
  background: inherit;
  border-bottom: 1px solid ${({ theme }) => theme.outline.weaker};
  border-radius: 0;
`;

export default GroupSectionField;
