import React, { useRef } from "react";

import Dropdown, { Ref as DropDownRef } from "@reearth/beta/components/Dropdown";
import Text from "@reearth/beta/components/Text";
import {
  MenuListItemLabel,
  MenuList,
  MenuListItem,
} from "@reearth/beta/features/Navbar/Menus/MenuList";
import { Project } from "@reearth/beta/features/Navbar/types";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

type Props = {
  currentProject: Project;
  workspaceId?: string;
};

const ProjectMenu: React.FC<Props> = ({ currentProject, workspaceId }) => {
  const documentationUrl = window.REEARTH_CONFIG?.documentationUrl;
  const t = useT();
  const theme = useTheme();
  const dropDownRef = useRef<DropDownRef>(null);

  return (
    <Wrapper>
      <StyledDropdown
        ref={dropDownRef}
        openOnClick
        noHoverStyle
        direction="down"
        hasIcon
        label={
          <Text size="m" weight="bold" color={theme.main.weak}>
            {currentProject?.name}
          </Text>
        }>
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
      </StyledDropdown>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  min-width: 200px;
  height: 100%;
`;

const StyledDropdown = styled(Dropdown)`
  padding: 0 12px;
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
