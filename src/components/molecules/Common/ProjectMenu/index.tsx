import React from "react";
import { useIntl } from "react-intl";

import Dropdown from "@reearth/components/atoms/Dropdown";
import Text from "@reearth/components/atoms/Text";
import { Project } from "@reearth/components/molecules/Common/Header";
import {
  MenuListItemLabel,
  MenuList,
  MenuListItem,
} from "@reearth/components/molecules/Common/MenuList";
import { styled, useTheme } from "@reearth/theme";

type Props = {
  currentProject: Project;
  teamId?: string;
};

const ProjectMenu: React.FC<Props> = ({ currentProject, teamId }) => {
  const intl = useIntl();
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
                linkTo={`/settings/project/${currentProject.id}`}
                text={intl.formatMessage({ defaultMessage: "Project settings" })}
              />
            </MenuListItem>
            <MenuListItem>
              <MenuListItemLabel
                linkTo={`/settings/project/${currentProject.id}/dataset`}
                text={intl.formatMessage({ defaultMessage: "Datasets" })}
              />
            </MenuListItem>
            {/* <MenuListItem>
              <MenuListItemLabel
                linkTo={`/settings/project/${currentProject.id}/plugins`}
                text={intl.formatMessage({ defaultMessage: "Plugins" })}
              />
            </MenuListItem> */}
            <Spacer />
            <MenuListItem>
              <MenuListItemLabel
                linkTo={`/settings/workspace/${teamId}/projects`}
                text={intl.formatMessage({ defaultMessage: "Manage projects" })}
              />
            </MenuListItem>
            <Spacer />
            <MenuListItem>
              <MenuListItemLabel
                icon="dashboard"
                linkTo={`/dashboard/${teamId}`}
                text={intl.formatMessage({ defaultMessage: "Top page" })}
              />
            </MenuListItem>
            <MenuListItem>
              <MenuListItemLabel
                icon="help"
                linkTo="/projects"
                text={intl.formatMessage({ defaultMessage: "Help" })}
              />
            </MenuListItem>
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
