import { Dispatch, Fragment, SetStateAction } from "react";

import FieldComponents from "@reearth/beta/components/fields/PropertyFields";
import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import PopoverMenuContent from "@reearth/beta/components/PopoverMenuContent";
import Text from "@reearth/beta/components/Text";
import { Item } from "@reearth/services/api/propertyApi/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import useHooks from "./hooks";

type Props = {
  title?: string;
  icon?: string;
  isSelected?: boolean;
  showSettings?: boolean;
  showPadding?: boolean;
  editMode: boolean;
  propertyId?: string;
  panelSettings?: Item;
  setShowPadding: Dispatch<SetStateAction<boolean>>;
  onEditModeToggle: () => void;
  onSettingsToggle: () => void;
  onRemove?: () => void;
};

const ActionPanel: React.FC<Props> = ({
  title,
  icon,
  isSelected,
  showSettings,
  showPadding,
  editMode,
  propertyId,
  panelSettings,
  setShowPadding,
  onEditModeToggle,
  onSettingsToggle,
  onRemove,
}) => {
  const t = useT();
  const { actionItems } = useHooks({
    title,
    icon,
    isSelected,
    editMode,
    onEditModeToggle,
    onSettingsToggle,
  });

  return (
    <Wrapper isSelected={isSelected}>
      <Icon icon="dndHandle" size={16} />
      <Popover.Provider
        open={showSettings}
        onOpenChange={onSettingsToggle}
        placement="bottom-start">
        <BlockOptions isSelected={isSelected}>
          {actionItems.map(
            (a, idx) =>
              !a.hide && (
                <Fragment key={idx}>
                  <Popover.Trigger asChild>
                    <OptionWrapper showPointer={!isSelected || !!a.onClick} onClick={a.onClick}>
                      <OptionIcon icon={a.icon} size={16} />
                      {a.blockName && (
                        <OptionText size="footnote" customColor>
                          {a.blockName}
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
                  <FieldComponents propertyId={propertyId} item={panelSettings} />
                </SettingsContent>
              )}
            </SettingsDropdown>
          ) : (
            <PopoverMenuContent
              size="sm"
              items={[
                {
                  name: t("Padding settings"),
                  icon: "padding",
                  onClick: () => setShowPadding(true),
                },
                {
                  name: t("Remove"),
                  icon: "trash",
                  onClick: onRemove,
                },
              ]}
            />
          )}
        </Popover.Content>
      </Popover.Provider>
    </Wrapper>
  );
};

export default ActionPanel;

const Wrapper = styled.div<{ isSelected?: boolean }>`
  color: ${({ theme }) => theme.select.main};
  display: flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  position: absolute;
  right: -1px;
  top: -25px;
  transition: all 0.2s;
`;

const BlockOptions = styled.div<{ isSelected?: boolean }>`
  background: ${({ isSelected, theme }) => (isSelected ? theme.select.main : "transparent")};
  color: ${({ isSelected, theme }) => (isSelected ? theme.content.main : theme.select.main)};
  display: flex;
  align-items: center;
  height: 24px;
  transition: all 0.2s;
`;

const OptionWrapper = styled.div<{ showPointer?: boolean }>`
  display: flex;
  align-items: center;
  ${({ showPointer }) => showPointer && "cursor: pointer;"}
`;

const OptionText = styled(Text)`
  padding-right: 4px;
`;

const OptionIcon = styled(Icon)`
  padding: 4px;
  border-left: 1px solid #f1f1f1;
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
