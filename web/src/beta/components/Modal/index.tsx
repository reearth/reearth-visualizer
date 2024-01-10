import { ReactNode, useCallback, useState } from "react";

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
  isContent?: boolean;
  onClose?: () => void;
  onTabChange?: (tabId: string) => void;
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
  isContent,
  onClose,
  onTabChange,
  sidebarTabs,
}) => {
  const [tabsFields] = useState<SwitchField<SidebarTab>[]>(
    sidebarTabs?.map((tab, index) => ({
      active: index === 0,
      ...tab,
    })) || [],
  );

  const { handleActivate, fields: tabs } = useManageSwitchState({
    fields: tabsFields,
  });

  const handleTabChange = useCallback(
    (tabId: string) => {
      handleActivate(tabId);
      onTabChange?.(tabId);
    },
    [handleActivate, onTabChange],
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
          {tabs.length > 0 && <Content>{tabs.find(tab => tab.active === true)?.content}</Content>}
          {children && <Content isContent={isContent}> {children}</Content>}
          {button1 || button2 ? (
            <ButtonWrapper>
              {tabs.find(tab => tab.active === true)?.tabButton1 ?? button1}
              {tabs.find(tab => tab.active === true)?.tabButton2 ?? button2}
            </ButtonWrapper>
          ) : null}
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
  background: ${({ theme }) => theme.bg[0]};
  border-right: 1px solid ${({ theme }) => theme.bg[3]};
`;

const Tab = styled.button<{ isSelected?: boolean }>`
  display: flex;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${({ isSelected, theme }) => (isSelected ? theme.bg[2] : "transparent")};
  color: ${({ isSelected, theme }) => (isSelected ? theme.content.main : theme.content.weak)};
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Content = styled.div<{ isContent?: boolean }>`
  display: flex;
  padding: ${({ isContent, theme }) => (isContent ? theme.spacing.normal : theme.spacing.super)}px;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.largest}px;
  align-self: stretch;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-self: stretch;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.normal}px;
  padding: ${({ theme }) => theme.spacing.normal}px;
  background: ${({ theme }) => theme.bg[1]};
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
`;

export default Modal;
