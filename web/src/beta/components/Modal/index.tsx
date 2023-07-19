import { ReactNode, useState } from "react";

import Wrapper from "@reearth/beta/components/Modal/ModalFrame";
//  import { styled, useTheme } from "@reearth/services/theme";
import { styled } from "@reearth/services/theme";

type Size = "sm" | "md" | "lg";

type SidebarTab = {
  id: string;
  label: string;
  content: ReactNode;
  tabButton1?: ReactNode;
  tabButton2?: ReactNode;
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
      {sidebarTabs.length > 0 ? (
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
            <TabContent />
            {selectedTab && sidebarTabs.find(tab => tab.id === selectedTab)?.content}
            <TabButtonWrapper>
              {selectedTab && sidebarTabs.find(tab => tab.id === selectedTab)?.tabButton1}
              {selectedTab && sidebarTabs.find(tab => tab.id === selectedTab)?.tabButton2}
            </TabButtonWrapper>
          </SidebarContentWrapper>
        </SidebarWrapper>
      ) : (
        <>
          <ContentWrapper hasSidebar={sidebarTabs.length > 0}>{children}</ContentWrapper>
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
  align-items: flex-start;
  align-self: stretch;
`;

const Sidebar = styled.div`
  display: flex;
  padding: var(--spacing-large, 16px);
  align-items: flex-start;
  gap: 10px;
  align-self: stretch;
  border-right: 1px solid var(--editor-outline-weak, #525252);
`;

const Tab = styled.button<{ isActive: boolean }>(
  ({ isActive }) => ({
    backgroundColor: isActive ? "blue" : "transparent",
    color: isActive ? "white" : "black",
  }),
  `display: flex;
padding: var(--radius-small, 4px) var(--spacing-small, 8px);
align-items: flex-start;
align-self: stretch;
border-radius: var(--spacing-smallest, 4px);
background: var(--editor-background-2, #393939);`,
);

const SidebarContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1 0 0;
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

const TabContent = styled.div`
  display: flex;
  padding: var(--spacing-normal, 12px);
  justify-content: flex-end;
  align-items: flex-start;
  gap: var(--spacing-normal, 12px);
  align-self: stretch;

  border-top: 1px solid var(--editor-outline-weak, #525252);
`;

const TabButtonWrapper = styled.div`
  display: flex;
  padding: var(--spacing-large, 16px);
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-largest, 20px);
  align-self: stretch;
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
