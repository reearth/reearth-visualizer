import React from "react";
import { useIntl } from "react-intl";
import NavigationItem from "@reearth/components/molecules/Settings/NavigationItem";
import { styled } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";
import Divider from "@reearth/components/atoms/Divider";
import { metricsSizes } from "@reearth/theme/metrics";
import logoColorful from "@reearth/components/atoms/Logo/reearthLogoColorful.svg";

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
        <StyledImg src={logoColorful} alt="Re:Earth Logo" />
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
        <Divider margin="0" />
        <NavigationItem
          to={`/settings/workspace/${team?.id}/projects`}
          name={intl.formatMessage({ defaultMessage: "Project List" })}>
          {project && !project.isArchived && (
            <NavigationItem to={`/settings/project/${project.id}`} name={project.name as string}>
              <NavigationItem
                to={`/settings/project/${project.id}/public`}
                name={intl.formatMessage({ defaultMessage: "Public" })}
              />
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${metricsSizes["4xl"]}px;
  box-sizing: border-box;
`;

const LogoWrapper = styled.div`
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.main.text};
  margin-bottom: ${metricsSizes["4xl"]}px;
`;

const StyledImg = styled.img`
  width: 100px;
`;

const NavigationList = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  font-size: ${fonts.sizes.m}px;
`;

export default Navigation;
