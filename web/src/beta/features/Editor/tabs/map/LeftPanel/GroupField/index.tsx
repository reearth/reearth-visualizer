import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import Text from "@reearth/beta/components/Text";
import type { NLSLayer } from "@reearth/services/api/layersApi/utils";
import { PropertySchemaGroup } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import Layers from "../Layers";

type GroupSectionFieldProps = {
  groups: PropertySchemaGroup[];
  layers: NLSLayer[];
  onLayerDelete: (id: string) => void;
  onLayerSelect: (id: string) => void;
  openDataSourceManager: () => void;
};

const GroupSectionField: React.FC<GroupSectionFieldProps> = ({
  groups,
  layers,
  onLayerDelete,
  onLayerSelect,
  openDataSourceManager,
}) => {
  const t = useT();

  return (
    <>
      <SidePanelSectionField title={t("Scene")}>
        {groups.map(({ schemaGroupId, title }) => (
          <GroupSectionFieldText key={schemaGroupId} size="footnote">
            {title}
          </GroupSectionFieldText>
        ))}
      </SidePanelSectionField>
      <SidePanelSectionField title={t("Layers")}>
        <Layers
          layers={layers}
          onLayerDelete={onLayerDelete}
          onLayerSelect={onLayerSelect}
          openDataSourceManager={openDataSourceManager}
        />
      </SidePanelSectionField>
    </>
  );
};

const GroupSectionFieldText = styled(Text)`
  padding-left: 4px;
  padding-bottom: 4px;
  cursor: pointer;
`;

export default GroupSectionField;
