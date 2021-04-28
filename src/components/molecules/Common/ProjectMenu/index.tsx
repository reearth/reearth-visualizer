import React from "react";
import { useIntl } from "react-intl";
import { styled } from "@reearth/theme";
import {
  MenuListItemLabel,
  MenuList,
  MenuListItem,
} from "@reearth/components/molecules/Common/MenuList";
import Dropdown from "@reearth/components/atoms/Dropdown";
import { Project } from "@reearth/components/molecules/Common/Header";

type Props = {
  currentProject: Project;
  teamId?: string;
};

const ProjectMenu: React.FC<Props> = ({ currentProject, teamId }) => {
  const intl = useIntl();

  return (
    <Wrapper>
      <Dropdown
        label={<MenuTitle>{currentProject?.name}</MenuTitle>}
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

const MenuTitle = styled.p`
  color: ${props => props.theme.main.strongText};
  padding: 8px;
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
