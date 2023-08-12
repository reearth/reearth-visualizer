import { ReactNode } from "react";

import { styled } from "@reearth/services/theme";

import Template from "../../Template";

import ActionPanel from "./ActionPanel";
import useHooks from "./hooks";

type Spacing = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type Props = {
  title?: string;
  icon?: string;
  padding?: Spacing;
  isSelected?: boolean;
  children?: ReactNode;
  onClick: (() => void) | undefined;
  onRemove?: () => void;
};

const BlockWrapper: React.FC<Props> = ({
  title,
  icon,
  padding,
  isSelected,
  children,
  onClick,
  onRemove,
}) => {
  const {
    isHovered,
    editMode,
    showSettings,
    showPadding,
    setShowPadding,
    handleMouseEnter,
    handleMouseLeave,
    handleBlockClick,
    handleEditModeToggle,
    handleSettingsToggle,
  } = useHooks({
    isSelected,
    onClick,
  });

  return (
    <Wrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      isSelected={isSelected}>
      {(isHovered || isSelected) && (
        <ActionPanel
          title={title}
          icon={icon}
          isSelected={isSelected}
          showSettings={showSettings}
          showPadding={showPadding}
          editMode={editMode}
          setShowPadding={setShowPadding}
          onEditModeToggle={handleEditModeToggle}
          onSettingsToggle={handleSettingsToggle}
          onRemove={onRemove}
        />
      )}
      <Block padding={padding} onClick={handleBlockClick}>
        {children ?? <Template icon={icon} />}
      </Block>
      {editMode && (
        <EditorPanel>
          <p>Block editing</p>
        </EditorPanel>
      )}
    </Wrapper>
  );
};

export default BlockWrapper;

const Wrapper = styled.div<{ isSelected?: boolean }>`
  border-width: 1px;
  border-style: solid;
  border-color: ${({ isSelected, theme }) => (isSelected ? theme.select.main : "transparent")};
  transition: all 0.3s;
  padding: 1px;
  position: relative;

  :hover {
    border-color: ${({ isSelected, theme }) => !isSelected && theme.select.weaker};
  }
`;

const Block = styled.div<{ padding?: Spacing }>`
  display: flex;
  min-height: 255px;
  padding-top: ${({ padding }) => padding?.top + "px" ?? 0};
  padding-bottom: ${({ padding }) => padding?.bottom + "px" ?? 0};
  padding-left: ${({ padding }) => padding?.left + "px" ?? 0};
  padding-right: ${({ padding }) => padding?.right + "px" ?? 0};
  cursor: pointer;
`;

const EditorPanel = styled.div`
  background: ${({ theme }) => theme.bg[1]};
  color: ${({ theme }) => theme.content.main};
  height: 100px;
  padding: 12px;
  z-index: 100;
  position: absolute;
  top: 100%;
  left: -1px;
  right: -1px;
`;
