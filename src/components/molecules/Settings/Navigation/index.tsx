import React from "react";
import { useIntl } from "react-intl";
import NavigationItem from "@reearth/components/molecules/Settings/NavigationItem";
import { styled } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";

type Team = {
  id?: string;
  name?: string;
};

type Project = {
  id?: string;
  name?: string;
};

type Props = {
  team?: Team;
  project?: Project;
};

const Navigation: React.FC<Props> = ({ team, project }) => {
  const intl = useIntl();

  return (
    <Wrapper>
      <NavigationList>
        <NavigationItem
          to="/settings/account"
          name={intl.formatMessage({ defaultMessage: "Account" })}
        />
        <NavigationItem
          to={`/settings/workspaces`}
          name={intl.formatMessage({ defaultMessage: "Workspaces" })}>
          {team && (
            <NavigationItem
              to={`/settings/workspace/${team.id}`}
              key={team.id}
              name={team.name as string}>
              <NavigationItem
                to={`/settings/workspace/${team.id}/asset`}
                name={intl.formatMessage({ defaultMessage: "Assets" })}
              />
            </NavigationItem>
          )}
        </NavigationItem>
        <NavigationItem
          to={`/settings/workspace/${team?.id}/projects`}
          name={intl.formatMessage({ defaultMessage: "Projects list" })}>
          {project && (
            <NavigationItem to={`/settings/project/${project.id}`} name={project.name as string}>
              <NavigationItem
                to={`/settings/project/${project.id}/dataset`}
                name={intl.formatMessage({ defaultMessage: "Dataset" })}
              />
              <NavigationItem
                to={`/settings/project/${project.id}/plugins`}
                name={intl.formatMessage({ defaultMessage: "Plugins" })}
              />
            </NavigationItem>
          )}
        </NavigationItem>
      </NavigationList>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  margin-left: 10px;
  margin-right: 80px;
`;

const NavigationList = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  font-size: ${fonts.sizes.l}px;
  font-weight: bold;
`;

export default Navigation;
