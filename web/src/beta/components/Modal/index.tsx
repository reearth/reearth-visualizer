import { ReactNode, useState } from "react";

import Wrapper from "@reearth/beta/components/Modal/ModalFrame";
import { styled } from "@reearth/services/theme";

type Size = "sm" | "md" | "lg";

export type SidebarTab = {
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
          <NavBarWrapper>
            {sidebarTabs.map(tab => (
              <Tab
                key={tab.id}
                isSelected={selectedTab === tab.id}
                onClick={() => handleTabChange(tab.id)}>
                {tab.label}
              </Tab>
            ))}
          </NavBarWrapper>
          <SidebarContentWrapper>
            <TabContent>
              {selectedTab && sidebarTabs.find(tab => tab.id === selectedTab)?.content}
            </TabContent>
            <TabButtonWrapper>
              {selectedTab && sidebarTabs.find(tab => tab.id === selectedTab)?.tabButton1}
              {selectedTab && sidebarTabs.find(tab => tab.id === selectedTab)?.tabButton2}
            </TabButtonWrapper>
          </SidebarContentWrapper>
        </SidebarWrapper>
      ) : (
        <>
          <ContentWrapper>{children}</ContentWrapper>
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

const NavBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  align-items: flex-start;
  gap: 10px;
  align-self: stretch;
  border-right: 1px solid ${({ theme }) => theme.editor.weakOutline};
`;

const Tab = styled.button<{ isSelected: boolean }>`
  display: flex;
  padding: 4px 8px;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 4px;
  background: ${({ isSelected, theme }) => (isSelected ? theme.editor.bg1 : `transparent`)};
  color: ${({ isSelected, theme }) => (isSelected ? `white` : theme.editor.bg1)};
`;

const SidebarContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1 0 0;
`;

const ContentWrapper = styled.div`
  display: flex;
  padding: 24px;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  flex: 1;
`;

const TabContent = styled.div`
  display: flex;
  padding: 16px;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
`;

const TabButtonWrapper = styled.div`
  display: flex;
  padding: 16px;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 20px;
  align-self: stretch;
  border-top: 1px solid ${({ theme }) => theme.editor.weakOutline};
`;

const ButtonWrapper = styled.div`
  display: flex;
  padding: 12px;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
  border-top: 1px solid ${({ theme }) => theme.editor.weakOutline};
`;

export default Modal;
