import React from "react";
import { Link } from "@reach/router";
import { styled } from "@reearth/theme";
import colors from "@reearth/theme/colors";
import Navigation from "@reearth/components/molecules/Settings/Navigation";
import Header, { Props as HeaderProps } from "@reearth/components/molecules/Common/Header";
import ProjectMenu from "@reearth/components/molecules/Common/ProjectMenu";
import Icon from "@reearth/components/atoms/Icon";

type Props = {} & HeaderProps;

const SettingPage: React.FC<Props> = ({
  children,
  currentTeam,
  currentProject,
  sceneId,
  ...props
}) => {
  const center = currentProject && (
    <ProjectMenu currentProject={currentProject} teamId={currentTeam?.id} />
  );

  return (
    <Wrapper>
      <Header
        {...props}
        currentTeam={currentTeam}
        icon={
          currentProject && (
            <StyledLink to={`/edit/${sceneId}`}>
              <StyledIcon icon="earthEditor" size={25} />
            </StyledLink>
          )
        }
        center={center}
      />
      <Wrapper3>
        <Navigation team={currentTeam} project={currentProject} />
        <Content>{children}</Content>
      </Wrapper3>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 100%;
  background-color: ${props => props.theme.colors.bg[2]};
  overflow: scroll;
`;

const Wrapper3 = styled.div`
  display: flex;
  flex: 1;
  margin-top: 18px;
  padding: 20px 60px 120px 60px;
`;

const Content = styled.div`
  flex: 1;
  margin: 0 auto;
  padding: 0 50px;
  max-width: 943px;
  box-sizing: border-box;
`;

const StyledLink = styled(Link)`
  color: ${colors.text.main};
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }
`;

const StyledIcon = styled(Icon)`
  border-radius: 5px;
  margin-right: 8px;
  padding: 5px 4px 5px 8px;
  color: ${colors.text.main};

  &:hover {
    background: ${colors.bg[5]};
  }
`;

export default SettingPage;
