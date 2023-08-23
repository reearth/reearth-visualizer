import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import Text from "@reearth/beta/components/Text";
import { PropertySchemaGroup } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type GroupSectionFieldProps = {
  groups: PropertySchemaGroup[];
};

const GroupSectionField: React.FC<GroupSectionFieldProps> = ({ groups }) => {
  const t = useT();

  return (
    <SidePanelSectionField title={t("Scene")}>
      {groups.map(({ schemaGroupId, title }) => (
        <GroupSectionFieldText key={schemaGroupId} size="footnote">
          {title}
        </GroupSectionFieldText>
      ))}
    </SidePanelSectionField>
  );
};

const GroupSectionFieldText = styled(Text)`
  padding-left: 4px;
  padding-bottom: 4px;
  cursor: pointer;
`;

export default GroupSectionField;
