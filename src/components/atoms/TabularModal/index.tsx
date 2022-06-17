import { ReactNode } from "react";

import Modal from "@reearth/components/atoms/Modal";
import { styled } from "@reearth/theme";

export type Props<Tab extends string = string> = {
  children?: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg";
  button1?: React.ReactNode;
  button2?: React.ReactNode;
  tabs: Tab[];
  tabLabels?: { [t in Tab]: string };
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
  isVisible?: boolean;
  onClose?: () => void;
};

export default function TabularModal<Tab extends string = string>({
  title,
  size,
  button1,
  button2,
  tabs,
  tabLabels,
  currentTab,
  setCurrentTab,
  isVisible,
  children,
  onClose,
}: Props<Tab>) {
  return (
    <Modal
      title={title}
      size={size}
      isVisible={isVisible}
      onClose={onClose}
      button1={button1}
      button2={button2}>
      <Tabs>
        {tabs.map(t => (
          <Tab selected={currentTab == t} onClick={() => setCurrentTab(t)} key={t}>
            {tabLabels?.[t] || t}
          </Tab>
        ))}
      </Tabs>
      <Content>{children}</Content>
    </Modal>
  );
}

const Tabs = styled.div`
  display: flex;
  color: ${({ theme }) => theme.main.strongText};
`;

const Tab = styled.p<{ selected?: boolean }>`
  background: ${props => (props.selected ? props.theme.modal.innerBg : props.theme.modal.bodyBg)};
  padding: 16px 24px;
  cursor: pointer;
`;

const Content = styled.div`
  background: ${props => props.theme.modal.innerBg};
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 552px;
`;
