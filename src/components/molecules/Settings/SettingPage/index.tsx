import { Link } from "@reach/router";
import React, { useState } from "react";

import Icon from "@reearth/components/atoms/Icon";
import Loading from "@reearth/components/atoms/Loading";
import Header, { Props } from "@reearth/components/molecules/Common/Header";
import ProjectMenu from "@reearth/components/molecules/Common/ProjectMenu";
import Navigation from "@reearth/components/molecules/Settings/Navigation";
import { styled } from "@reearth/theme";
import { handleScroll } from "@reearth/util/handleScroll";

export type SettingPageProps = {
  loading?: boolean;
  hasMoreItems?: boolean;
  onScroll?: () => void;
} & Props;

const SettingPage: React.FC<SettingPageProps> = ({
  children,
  currentTeam,
  currentProject,
  sceneId,
  loading,
  hasMoreItems,
  onScroll,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = () => {
    setIsOpen(o => !o);
  };

  return (
    <Wrapper>
      <StyledHeader
        {...props}
        currentTeam={currentTeam}
        icon={
          currentProject && (
            <StyledLink to={`/edit/${sceneId}`}>
              <StyledIcon icon="earthEditor" size={25} />
            </StyledLink>
          )
        }
        center={
          currentProject && <ProjectMenu currentProject={currentProject} teamId={currentTeam?.id} />
        }
      />
      <BodyWrapper
        onScroll={e => {
          !loading && hasMoreItems && handleScroll(e, onScroll);
        }}>
        <LeftWrapper>
          <Navigation team={currentTeam} project={currentProject} />
        </LeftWrapper>
        <RightWrapper>
          <ContentWrapper>
            <DeviceMenu>
              <MenuIcon
                icon={isOpen ? "cancel" : "menuForDevice"}
                size={32}
                onClick={handleClick}
              />
              {isOpen && (
                <Menu>
                  <Navigation team={currentTeam} project={currentProject} />
                </Menu>
              )}
            </DeviceMenu>
            {children}
            {hasMoreItems && loading && <StyledLoading relative />}
          </ContentWrapper>
        </RightWrapper>
      </BodyWrapper>
    </Wrapper>
  );
};

const StyledHeader = styled(Header)`
  position: fixed;
  box-shadow: 0 4px 24px #1d1d1d;
  z-index: ${props => props.theme.zIndexes.settingHeader};
`;

const Wrapper = styled.div`
  height: 100%;
  background-color: ${({ theme }) => theme.main.deepBg};
  display: flex;
  flex-direction: column;
`;

const BodyWrapper = styled.div`
  height: 100%;
  padding-top: 48px;
  overflow-y: scroll;
`;

const LeftWrapper = styled.div`
  width: 264px;
  height: 100%;
  background-color: ${({ theme }) => theme.main.paleBg};
  position: fixed;
  @media only screen and (max-width: 1024px) {
    display: none;
  }
`;

const RightWrapper = styled.div`
  margin-left: 264px;
  padding: 32px 64px;
  box-sizing: border-box;
  @media only screen and (max-width: 1024px) {
    margin: 0 auto;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  > * {
    margin-bottom: 32px;
  }
`;

const DeviceMenu = styled.div`
  padding: 0;
  width: 100%;
  height: 24px;
  display: none;
  @media only screen and (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
`;

const Menu = styled.div`
  width: 264px;
  display: flex;
  justify-content: center;
  box-shadow: 0 4px 16px #1d1d1d;
  background-color: ${({ theme }) => theme.main.paleBg};
  z-index: ${props => props.theme.zIndexes.menuForDevice};
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.main.text};
  text-decoration: none;
  &:hover {
    text-decoration: none;
  }
`;

const StyledIcon = styled(Icon)`
  border-radius: 5px;
  margin-right: 8px;
  padding: 5px 4px 5px 8px;
  color: ${({ theme }) => theme.main.text};
  &:hover {
    background: ${({ theme }) => theme.main.bg};
  }
`;

const MenuIcon = styled(Icon)`
  border-radius: 4px;
  margin-bottom: 12px;
  padding: 4px;
  color: ${({ theme }) => theme.main.text};
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.main.bg};
  }
`;

const StyledLoading = styled(Loading)`
  margin: 52px auto;
`;

export default SettingPage;
