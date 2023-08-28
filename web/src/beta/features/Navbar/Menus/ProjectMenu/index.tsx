import Dropdown, { MenuItem } from "@reearth/beta/components/Dropdown";
import Text from "@reearth/beta/components/Text";
import { Project } from "@reearth/beta/features/Navbar/types";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Props = {
  currentProject: Project;
  workspaceId?: string;
};

const ProjectMenu: React.FC<Props> = ({ currentProject, workspaceId }) => {
  const documentationUrl = window.REEARTH_CONFIG?.documentationUrl;
  const t = useT();

  const menuItems: MenuItem[] = [
    {
      text: t("Project settings"),
      linkTo: `/settings/project/${currentProject.id}`,
    },
    {
      text: t("Story"),
      linkTo: `/settings/project/${currentProject.id}/story`,
    },
    {
      text: t("Public"),
      linkTo: `/settings/project/${currentProject.id}/public`,
    },
    {
      text: t("Workspace assets"),
      linkTo: `/settings/project/${currentProject.id}/asset`,
    },
    {
      text: t("Plugin"),
      linkTo: `/settings/project/${currentProject.id}/plugins`,
    },
    { breakpoint: true },
    {
      text: t("Manage projects"),
      linkTo: `/settings/project/${workspaceId}/projects`,
    },
  ];

  if (documentationUrl) {
    menuItems.push(
      ...[
        {
          breakpoint: true,
        },
        {
          text: t("Documentation"),
          icon: "help" as const,
          onClick: () => window.open(documentationUrl, "_blank", "noopener"),
        },
      ],
    );
  }

  return (
    <StyledDropdown
      openOnClick
      direction="down"
      gap="md"
      hasIcon
      label={
        <Text size="body" weight="bold" customColor>
          {currentProject?.name}
        </Text>
      }
      menu={{
        width: 240,
        items: menuItems,
      }}
    />
  );
};

const StyledDropdown = styled(Dropdown)`
  height: 100%;
  margin-left: -8px;
  margin-right: -8px;
  color: ${({ theme }) => theme.content.weak};
`;

export default ProjectMenu;
