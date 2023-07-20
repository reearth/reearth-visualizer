import { ReactNode, useCallback, useState } from "react";

import Wrapper from "@reearth/beta/components/Modal/ModalFrame";
import useManageSwitchState from "@reearth/beta/hooks/useManageSwitchState/hooks";
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
  title?: string;
  size?: Size;
  button1?: ReactNode;
  button2?: ReactNode;
  children?: ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
  sidebarTabs?: SidebarTab[];
};

const Modal: React.FC<Props> = ({
  className,
  title,
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

  const { handleActivate } = useManageSwitchState({ fields: sidebarTabs });

  const handleTabChange = useCallback(
    (tabId: string) => {
      setSelectedTab(tabId);
      handleActivate(tabId);
    },
    [handleActivate],
  );

  return (
    <Wrapper
      className={className}
      size={size}
      isVisible={isVisible}
      title={title}
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
  align-self: stretch;
`;

const NavBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 10px;
  align-self: stretch;
  border-right: 1px solid #525252;
`;

const Tab = styled.button<{ isSelected: boolean }>`
  display: flex;
  padding: 4px 8px;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 4px;
  background: ${({ isSelected }) => (isSelected ? "#393939" : "transparent")};
  color: ${({ isSelected }) => (isSelected ? "white" : "#393939")};
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
  align-self: stretch;
  border-top: 1px solid #525252;
`;

const ButtonWrapper = styled.div`
  display: flex;
  padding: 12px;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
  border-top: 1px solid #525252;
`;

export default Modal;
