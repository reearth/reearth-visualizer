import { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Icon from "@reearth/components/atoms/Icon";
import Loading from "@reearth/components/atoms/Loading";
import Header, { Props } from "@reearth/components/molecules/Common/Header";
import ProjectMenu from "@reearth/components/molecules/Common/ProjectMenu";
import Navigation from "@reearth/components/molecules/Settings/Navigation";
import { styled } from "@reearth/theme";
import { autoFillPage, onScrollToBottom } from "@reearth/util/infinite-scroll";

export type SettingPageProps = {
  loading?: boolean;
  hasMoreItems?: boolean;
  sceneId?: string;
  children?: ReactNode;
  onScroll?: () => void;
} & Props;

const SettingPage: React.FC<SettingPageProps> = ({
  children,
  currentWorkspace,
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

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current && !loading && hasMoreItems) autoFillPage(wrapperRef, onScroll);
  }, [hasMoreItems, loading, onScroll]);

  return (
    <Wrapper>
      <StyledHeader
        {...props}
        currentWorkspace={currentWorkspace}
        icon={
          currentProject && (
            <StyledLink to={`/edit/${sceneId}`}>
              <StyledIcon icon="earthEditor" size={25} />
            </StyledLink>
          )
        }
        center={
          currentProject && (
            <ProjectMenu currentProject={currentProject} workspaceId={currentWorkspace?.id} />
          )
        }
      />
      <BodyWrapper
        ref={wrapperRef}
        onScroll={e => {
          !loading && hasMoreItems && onScrollToBottom(e, onScroll);
        }}>
        <LeftWrapper>
          <Navigation workspace={currentWorkspace} project={currentProject} />
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
                  <Navigation workspace={currentWorkspace} project={currentProject} />
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
  position: relative;
  > * {
    margin-bottom: 32px;
  }
`;

const DeviceMenu = styled.div`
  padding: 0;
  width: 100%;
  min-height: 24px;
  display: none;
  position: absolute;
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
