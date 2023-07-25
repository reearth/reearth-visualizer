import { ReactNode, useCallback, useEffect, useState } from "react";

import Wrapper from "@reearth/beta/components/Modal/ModalFrame";
import useManageSwitchState, { SwitchField } from "@reearth/beta/hooks/useManageSwitchState/hooks";
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
  sidebarTabs,
}) => {
  const [TabsFields, setTabsFields] = useState<SwitchField<SidebarTab>[]>([]);

  useEffect(() => {
    if (sidebarTabs) {
      const convertedFields: SwitchField<SidebarTab>[] = sidebarTabs.map((tab, index) => ({
        active: index === 0,
        ...tab,
      }));
      setTabsFields(convertedFields);
    }
  }, [sidebarTabs]);

  const { handleActivate, fields: tabs } = useManageSwitchState({
    fields: TabsFields,
  });

  const handleTabChange = useCallback(
    (tabId: string) => {
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
      <InnerWrapper>
        {tabs.length > 0 && (
          <NavBarWrapper>
            {tabs.map(tab => (
              <Tab key={tab.id} isSelected={tab.active} onClick={() => handleTabChange(tab.id)}>
                {tab.label}
              </Tab>
            ))}
          </NavBarWrapper>
        )}
        <ContentWrapper>
          {tabs && <Content>{tabs.find(tab => tab.active === true)?.content}</Content>}
          <Content> {children}</Content>
          <ButtonWrapper>
            {tabs.find(tab => tab.active === true)?.tabButton1 ?? button1}
            {tabs.find(tab => tab.active === true)?.tabButton2 ?? button2}
          </ButtonWrapper>
        </ContentWrapper>
      </InnerWrapper>
    </Wrapper>
  );
};

const InnerWrapper = styled.div`
  display: flex;
`;

const NavBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 10px;
  border-right: 1px solid #525252;
`;

const Tab = styled.button<{ isSelected?: boolean }>`
  display: flex;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${({ isSelected }) => (isSelected ? "#393939" : "transparent")};
  color: ${({ isSelected }) => (isSelected ? "#E0E0E0" : "#393939")};
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  padding: 24px;
  flex-direction: column;
  gap: 20px;
  align-self: stretch;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-self: stretch;
  justify-content: flex-end;
  border-top: 1px solid #525252;
`;

export default Modal;
