import React from "react";
import { useIntl } from "react-intl";

import Divider from "@reearth/components/atoms/Divider";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import NavigationItem from "@reearth/components/molecules/Settings/NavigationItem";
import { styled } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";
import { metricsSizes } from "@reearth/theme/metrics";

type Team = {
  id?: string;
  name?: string;
};

type Project = {
  id?: string;
  name?: string;
  isArchived?: boolean;
};

type Props = {
  team?: Team;
  project?: Project;
};

const Navigation: React.FC<Props> = ({ team, project }) => {
  const intl = useIntl();

  return (
    <Wrapper>
      <LogoWrapper>
        <Icon icon="logoColorful" size={110} />
      </LogoWrapper>
      <NavigationList>
        <NavigationItem
          to="/settings/account"
          name={intl.formatMessage({ defaultMessage: "Account" })}
        />
        <Divider margin="0" />
        <NavigationItem
          to={`/settings/workspaces`}
          name={intl.formatMessage({ defaultMessage: "Workspace List" })}>
          {team && (
            <NavigationItem
              level={2}
              to={`/settings/workspace/${team.id}`}
              key={team.id}
              name={team.name as string}>
              <NavigationItem
                level={3}
                to={`/settings/workspace/${team.id}/asset`}
                name={intl.formatMessage({ defaultMessage: "Assets" })}
              />
            </NavigationItem>
          )}
        </NavigationItem>
        <Divider margin="0" />
        <NavigationItem
          to={`/settings/workspace/${team?.id}/projects`}
          name={intl.formatMessage({ defaultMessage: "Project List" })}>
          {project && !project.isArchived && (
            <NavigationItem
              level={2}
              to={`/settings/project/${project.id}`}
              name={project.name as string}>
              <NavigationItem
                level={3}
                to={`/settings/project/${project.id}/public`}
                name={intl.formatMessage({ defaultMessage: "Public" })}
              />
              <NavigationItem
                level={3}
                to={`/settings/project/${project.id}/dataset`}
                name={intl.formatMessage({ defaultMessage: "Dataset" })}
              />
              <NavigationItem
                level={3}
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${metricsSizes["4xl"]}px;
  box-sizing: border-box;
`;

const LogoWrapper = styled(Flex)`
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${metricsSizes["4xl"]}px;
`;

const NavigationList = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  font-size: ${fonts.sizes.m}px;
`;

export default Navigation;
