import React from "react";

import Divider from "@reearth/classic/components/atoms/Divider";
import Flex from "@reearth/classic/components/atoms/Flex";
import Icon from "@reearth/classic/components/atoms/Icon";
import NavigationItem from "@reearth/classic/components/molecules/Settings/NavigationItem";
import { metricsSizes } from "@reearth/classic/theme";
import fonts from "@reearth/classic/theme/reearthTheme/common/fonts";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

type Workspace = {
  id?: string;
  name?: string;
};

type Project = {
  id?: string;
  name?: string;
  isArchived?: boolean;
};

type Props = {
  workspace?: Workspace;
  project?: Project;
};

const Navigation: React.FC<Props> = ({ workspace, project }) => {
  const t = useT();

  return (
    <Wrapper>
      <LogoWrapper>
        {window.REEARTH_CONFIG?.brand?.logoUrl ? (
          <img src={window.REEARTH_CONFIG.brand.logoUrl} style={{ maxWidth: "100%" }} />
        ) : (
          <Icon icon="logoColorful" size={110} />
        )}
      </LogoWrapper>
      <NavigationList>
        <NavigationItem to="/settings/account" name={t("Account")} />
        <Divider margin="0" />
        <NavigationItem to={`/settings/workspaces`} name={t("Workspace List")}>
          {workspace && (
            <NavigationItem
              level={2}
              to={`/settings/workspaces/${workspace.id}`}
              key={workspace.id}
              name={workspace.name as string}>
              <NavigationItem
                level={3}
                to={`/settings/workspaces/${workspace.id}/asset`}
                name={t("Assets")}
              />
            </NavigationItem>
          )}
        </NavigationItem>
        <Divider margin="0" />
        <NavigationItem
          to={`/settings/workspaces/${workspace?.id}/projects`}
          name={t("Project List")}>
          {project && !project.isArchived && (
            <NavigationItem
              level={2}
              to={`/settings/projects/${project.id}`}
              name={project.name as string}>
              <NavigationItem
                level={3}
                to={`/settings/projects/${project.id}/public`}
                name={t("Public")}
              />
              <NavigationItem
                level={3}
                to={`/settings/projects/${project.id}/dataset`}
                name={t("Dataset")}
              />
              <NavigationItem
                level={3}
                to={`/settings/projects/${project.id}/plugins`}
                name={t("Plugins")}
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
