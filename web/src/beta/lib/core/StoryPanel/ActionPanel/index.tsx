import { Dispatch, Fragment, MouseEvent, SetStateAction, useCallback, useMemo } from "react";

import { useItemContext } from "@reearth/beta/components/DragAndDropList/Item";
// import FieldComponents from "@reearth/beta/components/fields/PropertyFields";
import Icon, { Icons } from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Text from "@reearth/beta/components/Text";
import { stopClickPropagation } from "@reearth/beta/utils/events";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

export type ActionItem = {
  icon: string;
  name?: string;
  hide?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
};

export type ActionPosition = "left-top" | "left-bottom" | "right-top" | "right-bottom";

type Props = {
  isSelected?: boolean;
  showSettings?: boolean;
  showPadding?: boolean;
  propertyId?: string;
  panelSettings?: any;
  actionItems: ActionItem[];
  dndEnabled?: boolean;
  position?: ActionPosition;
  isHovered?: boolean;
  setShowPadding: Dispatch<SetStateAction<boolean>>;
  onSettingsToggle?: () => void;
  onRemove?: () => void;
};

const ActionPanel: React.FC<Props> = ({
  isSelected,
  showSettings,
  showPadding,
  propertyId,
  panelSettings,
  actionItems,
  position,
  dndEnabled,
  setShowPadding,
  onSettingsToggle,
  onRemove,
}) => {
  const t = useT();
  const ref = useItemContext();

  const handleRemove = useCallback(() => {
    onRemove?.();
    onSettingsToggle?.();
  }, [onRemove, onSettingsToggle]);

  const popoverContent = useMemo(() => {
    const menuItems: { name: string; icon: Icons; onClick: () => void }[] = [
      {
        name: t("Padding settings"),
        icon: "padding",
        onClick: () => setShowPadding(true),
      },
    ];
    if (onRemove) {
      menuItems.push({
        name: t("Remove"),
        icon: "trash",
        onClick: handleRemove,
      });
    }
    return menuItems;
  }, [t, setShowPadding, onRemove, handleRemove]);

  return (
    <Wrapper isSelected={isSelected} position={position} onClick={stopClickPropagation}>
      {dndEnabled && (
        <DndHandle ref={ref}>
          <Icon icon="dndHandle" size={16} />
        </DndHandle>
      )}
      <Popover.Provider
        open={showSettings && isSelected}
        onOpenChange={() => onSettingsToggle?.()}
        placement="bottom-start">
        <BlockOptions isSelected={isSelected}>
          {actionItems.map(
            (a, idx) =>
              !a.hide && (
                <Fragment key={idx}>
                  <Popover.Trigger asChild>
                    <OptionWrapper
                      showPointer={!isSelected || !!a.onClick}
                      onClick={a.onClick ?? stopClickPropagation}>
                      <OptionIcon icon={a.icon} size={16} border={idx !== 0} />
                      {a.name && (
                        <OptionText size="footnote" customColor>
                          {a.name}
                        </OptionText>
                      )}
                    </OptionWrapper>
                  </Popover.Trigger>
                </Fragment>
              ),
          )}
        </BlockOptions>
        <Popover.Content>
          {showPadding ? (
            <SettingsDropdown>
              <SettingsHeading>
                <Text size="footnote" customColor>
                  {panelSettings?.title}
                </Text>
                <CancelIcon icon="cancel" size={14} onClick={() => setShowPadding(false)} />
              </SettingsHeading>
              {propertyId && panelSettings && (
                <SettingsContent>
                  {/* <FieldComponents propertyId={propertyId} fields={panelSettings} /> */}
                </SettingsContent>
              )}
            </SettingsDropdown>
          ) : (
            <PopoverMenuContent size="sm" items={popoverContent} />
          )}
        </Popover.Content>
      </Popover.Provider>
    </Wrapper>
  );
};

export default ActionPanel;

const Wrapper = styled.div<{ isSelected?: boolean; position?: ActionPosition }>`
  ${({ isSelected }) => !isSelected && "background: #f1f1f1;"}
  z-index: 1;
  color: ${({ theme }) => theme.select.main};
  display: flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  position: absolute;
  ${({ position }) =>
    position === "left-top"
      ? `
  left: -1px;
  top: -25px;
  `
      : position === "left-bottom"
      ? `
  left: -1px;
  top: 0;
  `
      : position === "right-bottom"
      ? `
  top: 0;
  right: -1px;
  `
      : `
  right: -1px;
  top: -25px;
  `}
  z-index: 1;
`;

const BlockOptions = styled.div<{ isSelected?: boolean }>`
  background: ${({ isSelected, theme }) => (isSelected ? theme.select.main : "#f1f1f1")};
  color: ${({ isSelected, theme }) => (isSelected ? theme.content.main : theme.select.main)};
  display: flex;
  align-items: center;
  height: 24px;
`;

const OptionWrapper = styled.div<{ showPointer?: boolean }>`
  display: flex;
  align-items: center;
  cursor: ${({ showPointer }) => (showPointer ? "pointer" : "default")};
`;

const OptionText = styled(Text)`
  padding-right: 4px;
`;

const OptionIcon = styled(Icon)<{ border?: boolean }>`
  ${({ border }) => border && "border-left: 1px solid #f1f1f1;"}
  padding: 4px;
  transition: none;
`;

const SettingsDropdown = styled.div`
  z-index: 999;
  background: ${({ theme }) => theme.bg[1]};
  border-radius: 2px;
  border: 1px solid ${({ theme }) => theme.bg[3]};
`;

const SettingsHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.outline.weak};
  height: 28px;
  padding: 0 8px;
`;

const SettingsContent = styled.div`
  min-height: 134px;
  width: 200px;
  padding: 8px;
  box-sizing: border-box;
`;

const CancelIcon = styled(Icon)`
  cursor: pointer;
`;

const DndHandle = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  cursor: move;
`;
