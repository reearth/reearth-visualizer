import Loading from "@reearth/beta/components/Loading";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import Text from "@reearth/beta/components/Text";
import SidePanelCommon from "@reearth/beta/features/Editor/SidePanel";
import { useSceneFetcher } from "@reearth/services/api";
import { PropertySchemaGroup } from "@reearth/services/gql";
import { useT } from "@reearth/services/i18n";
import { useTheme, styled } from "@reearth/services/theme";

type Props = {
  sceneId: string;
};

type GroupSectionFieldProps = {
  groups: PropertySchemaGroup[];
};

const GroupSectionField: React.FC<GroupSectionFieldProps> = ({ groups }) => {
  const t = useT();

  return (
    <SidePanelSectionField title={t("Scene")}>
      {groups.map(({ schemaGroupId, title }) => (
        <GroupSectionFieldText key={schemaGroupId} size="footnote">
          {t(title as string)}
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

const MapSidePanel: React.FC<Props> = ({ sceneId }) => {
  const t = useT();
  const theme = useTheme();

  const { useSceneQuery } = useSceneFetcher();

  const { scene, loading: loadingScene } = useSceneQuery({ sceneId });

  // Extract the groups
  const groups = scene?.property?.schema?.groups;

  const loading = groups != undefined && loadingScene;

  return loading ? (
    <Loading animationSize={80} animationColor={theme.select.main} />
  ) : (
    <SidePanelCommon
      location="left"
      contents={[
        {
          id: "outline",
          title: t("Outline"),
          children: <GroupSectionField groups={groups} />,
        },
      ]}
    />
  );
};

export default MapSidePanel;
