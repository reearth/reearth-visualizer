import React from "react";

import Dropdown from "@reearth/components/atoms/Dropdown";
import Text from "@reearth/components/atoms/Text";
import { Project } from "@reearth/components/molecules/Common/Header";
import {
  MenuListItemLabel,
  MenuList,
  MenuListItem,
} from "@reearth/components/molecules/Common/MenuList";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";

type Props = {
  currentProject: Project;
  workspaceId?: string;
};

const ProjectMenu: React.FC<Props> = ({ currentProject, workspaceId }) => {
  const documentationUrl = window.REEARTH_CONFIG?.documentationUrl;
  const t = useT();
  const theme = useTheme();

  return (
    <Wrapper>
      <Dropdown
        label={
          <Text size="m" weight="bold" color={theme.main.strongText}>
            {currentProject?.name}
          </Text>
        }
        noHoverStyle
        centered
        hasIcon
        openOnClick>
        <DropdownInner>
          <MenuList>
            <MenuListItem>
              <MenuListItemLabel
                linkTo={`/settings/projects/${currentProject.id}`}
                text={t("Project settings")}
              />
            </MenuListItem>
            <MenuListItem>
              <MenuListItemLabel
                linkTo={`/settings/projects/${currentProject.id}/dataset`}
                text={t("Datasets")}
              />
            </MenuListItem>
            <MenuListItem>
              <MenuListItemLabel
                linkTo={`/settings/projects/${currentProject.id}/plugins`}
                text={t("Plugins")}
              />
            </MenuListItem>
            <Spacer />
            <MenuListItem>
              <MenuListItemLabel
                linkTo={`/settings/workspaces/${workspaceId}/projects`}
                text={t("Manage projects")}
              />
            </MenuListItem>
            {documentationUrl && (
              <>
                <Spacer />
                <MenuListItem>
                  <MenuListItemLabel
                    icon="help"
                    onClick={() => window.open(documentationUrl, "_blank", "noopener")}
                    text={t("Documentation")}
                  />
                </MenuListItem>
              </>
            )}
          </MenuList>
        </DropdownInner>
      </Dropdown>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  min-width: 200px;
  height: 100%;
`;

const DropdownInner = styled.div`
  padding: 0;
`;

const Spacer = styled.div`
  width: 100%;
  height: 1px;
  background-color: #3f3d45;
`;

export default ProjectMenu;
