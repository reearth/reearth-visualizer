import { ReactNode, useState } from "react";

import Divider from "@reearth/beta/components/Divider";
import Wrapper from "@reearth/beta/components/Modal/ModalFrame";
//  import { styled, useTheme } from "@reearth/services/theme";
import { styled } from "@reearth/services/theme";

type Size = "sm" | "md" | "lg";

type SidebarTab = {
  id: string;
  label: string;
  content: ReactNode;
};

type Props = {
  className?: string;
  modalTitle?: string;
  size?: Size;
  button1?: ReactNode;
  button2?: ReactNode;
  children?: ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
  showSidebar?: boolean;
  sidebarTabs?: SidebarTab[];
};

const Modal: React.FC<Props> = ({
  className,
  modalTitle,
  size = "md",
  button1,
  button2,
  children,
  isVisible,
  onClose,
  showSidebar = true,
  sidebarTabs = [],
}) => {
  // const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState<string | null>(
    sidebarTabs.length > 0 ? sidebarTabs[0].id : null,
  );

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
  };

  return (
    <Wrapper
      className={className}
      size={size}
      isVisible={isVisible}
      modalTitle={modalTitle}
      onClose={onClose}>
      {showSidebar && sidebarTabs.length > 0 ? (
        <SidebarWrapper>
          <Sidebar>
            {sidebarTabs.map(tab => (
              <Tab
                key={tab.id}
                isActive={selectedTab === tab.id}
                onClick={() => handleTabChange(tab.id)}>
                {tab.label}
              </Tab>
            ))}
          </Sidebar>
          <SidebarContentWrapper>
            {selectedTab && sidebarTabs.find(tab => tab.id === selectedTab)?.content}
            <Divider direction="Vertical" />
          </SidebarContentWrapper>
          <ButtonWrapper>
            {button2}
            {button1}
          </ButtonWrapper>
        </SidebarWrapper>
      ) : (
        <>
          <ContentWrapper hasSidebar={showSidebar && sidebarTabs.length > 0}>
            {children}
          </ContentWrapper>
          <ButtonWrapper>
            {button2}
            {button1}
          </ButtonWrapper>
        </>
      )}
    </Wrapper>
  );
};

const SidebarWrapper = styled.div`
  display: flex;
  height: 100%;
`;

const Sidebar = styled.div`
  /* Define styles for the sidebar */
`;

const Tab = styled.button<{ isActive: boolean }>(({ isActive }) => ({
  backgroundColor: isActive ? "blue" : "transparent",
  color: isActive ? "white" : "black",
}));

const SidebarContentWrapper = styled.div`
  /* Define styles for the sidebar content wrapper */
`;

const ContentWrapper = styled.div`
  display: flex;
  padding: var(--spacing-super, 24px);
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-largest, 20px);
  align-self: stretch;
  flex: ${({ hasSidebar }: { hasSidebar: boolean }) =>
    hasSidebar ? "0 1 calc(100% - 200px)" : "1"};
`;

const ButtonWrapper = styled.div`
  display: flex;
  padding: var(--spacing-normal, 12px);
  justify-content: flex-end;
  align-items: flex-start;
  gap: var(--spacing-normal, 12px);
  align-self: stretch;

  border-top: 1px solid var(--editor-outline-weak, #525252);
`;

export default Modal;
