import {
  Dispatch,
  ForwardRefRenderFunction,
  Fragment,
  MouseEvent,
  SetStateAction,
  forwardRef,
} from "react";

import Icon, { Icons } from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Text from "@reearth/beta/components/Text";
import { stopClickPropagation } from "@reearth/beta/utils/events";
import { styled } from "@reearth/services/theme";

import { FieldComponent } from "../../hooks/useFieldComponent";

export type ActionItem = {
  icon: string;
  name?: string;
  hide?: boolean;
  onClick?: (e?: MouseEvent<HTMLDivElement>) => void;
};

export type ActionPosition = "left-top" | "left-bottom" | "right-top" | "right-bottom";

type Props = {
  isSelected?: boolean;
  showSettings?: boolean;
  showPadding?: boolean;
  propertyId?: string;
  contentSettings?: any;
  actionItems: ActionItem[];
  dndEnabled?: boolean;
  position?: ActionPosition;
  overrideGroupId?: string;
  settingsTitle?: string;
  popoverContent: {
    name: string;
    icon: Icons;
    onClick: () => void;
  }[];
  setShowPadding: Dispatch<SetStateAction<boolean>>;
  onSettingsToggle?: () => void;
  onClick?: (e: any) => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: any,
    v?: any,
  ) => Promise<void>;
  onBlockMove?: (id: string, targetId: number, blockId: string) => void;
  onPropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
};

const ActionPanel: ForwardRefRenderFunction<HTMLDivElement, Props> = (
  {
    isSelected,
    showSettings,
    showPadding,
    propertyId,
    contentSettings,
    actionItems,
    dndEnabled,
    position,
    overrideGroupId,
    settingsTitle,
    popoverContent,
    setShowPadding,
    onSettingsToggle,
    onClick,
    onPropertyUpdate,
    onPropertyItemAdd,
    onPropertyItemMove,
    onPropertyItemDelete,
  },
  ref,
) => (
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
      <BlockOptions isSelected={isSelected} onClick={!isSelected ? onClick : undefined}>
        {actionItems.map(
          (a, idx) =>
            !a.hide && (
              <Fragment key={idx}>
                <Popover.Trigger asChild>
                  <OptionWrapper showPointer={!isSelected || !!a.onClick} onClick={a.onClick}>
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
      <StyledPopoverContent attachToRoot>
        {showPadding ? (
          <SettingsDropdown>
            <SettingsHeading>
              <Text size="footnote" customColor>
                {settingsTitle}
              </Text>
              <CancelIcon icon="cancel" size={14} onClick={() => setShowPadding(false)} />
            </SettingsHeading>
            {propertyId && contentSettings && (
              <SettingsContent>
                {Object.keys(contentSettings).map((fieldId, index) => {
                  const field = contentSettings[fieldId];
                  const groupId = overrideGroupId || "panel";
                  return (
                    <FieldComponent
                      key={index}
                      propertyId={propertyId}
                      groupId={groupId}
                      fieldId={fieldId}
                      field={field}
                      onPropertyUpdate={onPropertyUpdate}
                      onPropertyItemAdd={onPropertyItemAdd}
                      onPropertyItemMove={onPropertyItemMove}
                      onPropertyItemDelete={onPropertyItemDelete}
                    />
                  );
                })}
              </SettingsContent>
            )}
          </SettingsDropdown>
        ) : (
          <PopoverMenuContent size="sm" items={popoverContent} />
        )}
      </StyledPopoverContent>
    </Popover.Provider>
  </Wrapper>
);

export default forwardRef(ActionPanel);

const Wrapper = styled.div<{ isSelected?: boolean; position?: ActionPosition }>`
  ${({ isSelected }) => !isSelected && "background: #f1f1f1;"}
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
  left: 0;
  top: 0;
  `
      : position === "right-bottom"
      ? `
  top: 0;
  right: 0;
    `
      : `
  right: -1px;
  top: -25px;
  `}
`;

const BlockOptions = styled.div<{ isSelected?: boolean }>`
  background: ${({ isSelected, theme }) => (isSelected ? theme.select.main : "#f1f1f1")};
  color: ${({ isSelected, theme }) => (isSelected ? theme.content.main : theme.select.main)};
  display: flex;
  align-items: center;
  height: 24px;
`;

const StyledPopoverContent = styled(Popover.Content)`
  z-index: ${({ theme }) => theme.zIndexes.visualizer.storyBlock};
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
