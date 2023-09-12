import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import Text from "@reearth/beta/components/Text";
import type { LayerNameUpdateProps } from "@reearth/beta/features/Editor/useLayers";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { PropertySchemaGroup } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Layers from "../Layers";

type GroupSectionFieldProps = {
  groups: PropertySchemaGroup[];
  layers: NLSLayer[];
  selectedLayerId?: string;
  onLayerDelete: (id: string) => void;
  onLayerNameUpdate: (inp: LayerNameUpdateProps) => void;
  onLayerSelect: (id: string) => void;
  onDataSourceManagerOpen: () => void;
};

const GroupSectionField: React.FC<GroupSectionFieldProps> = ({
  groups,
  layers,
  selectedLayerId,
  onLayerDelete,
  onLayerNameUpdate,
  onLayerSelect,
  onDataSourceManagerOpen,
}) => {
  const t = useT();

  return (
    <>
      <StyledSidePanelSectionField title={t("Scene")}>
        {groups.map(({ schemaGroupId, title }) => (
          <GroupSectionFieldText key={schemaGroupId} size="footnote">
            {title}
          </GroupSectionFieldText>
        ))}
      </StyledSidePanelSectionField>
      <StyledSidePanelSectionField title={t("Layers")}>
        <Layers
          layers={layers}
          selectedLayerId={selectedLayerId}
          onLayerDelete={onLayerDelete}
          onLayerNameUpdate={onLayerNameUpdate}
          onLayerSelect={onLayerSelect}
          onDataSourceManagerOpen={onDataSourceManagerOpen}
        />
      </StyledSidePanelSectionField>
    </>
  );
};

const GroupSectionFieldText = styled(Text)`
  padding-left: 4px;
  padding-bottom: 4px;
  cursor: pointer;
`;

const StyledSidePanelSectionField = styled(SidePanelSectionField)`
  background: inherit;
  border-bottom: 1px solid ${({ theme }) => theme.outline.weaker};
  border-radius: 0;
`;

export default GroupSectionField;
