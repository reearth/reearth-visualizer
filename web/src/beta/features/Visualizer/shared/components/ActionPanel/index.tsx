import {
  Icon,
  IconName,
  Popup,
  PopupMenu,
  PopupMenuItem,
  PopupPanel
} from "@reearth/beta/lib/reearth-ui";
import { stopClickPropagation } from "@reearth/beta/utils/events";
import { styled } from "@reearth/services/theme";
import { Dispatch, FC, Fragment, MouseEvent, SetStateAction } from "react";

import { FieldComponent } from "../../hooks/useFieldComponent";

export type ActionItem = {
  icon: IconName;
  name?: string;
  hide?: boolean;
  onClick?: (e?: MouseEvent<HTMLDivElement>) => void;
};

export type ActionPosition =
  | "left-top"
  | "left-bottom"
  | "right-top"
  | "right-bottom";

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
  dragHandleClassName?: string;
  popupMenuItem: PopupMenuItem[];
  openMenu?: boolean;
  setShowPadding: Dispatch<SetStateAction<boolean>>;
  setOpenMenu: Dispatch<SetStateAction<boolean>>;
  onSettingsToggle?: () => void;
  onClick?: (e: any) => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: any,
    v?: any
  ) => Promise<void>;
  onBlockMove?: (id: string, targetId: number, blockId: string) => void;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
  onPopupMenuClick?: (e: MouseEvent<Element, globalThis.MouseEvent>) => void;
};

const ActionPanel: FC<Props> = ({
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
  popupMenuItem,
  dragHandleClassName,
  openMenu,
  setShowPadding,
  setOpenMenu,
  onSettingsToggle,
  onClick,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemMove,
  onPropertyItemDelete,
  onPopupMenuClick
}) => (
  <Wrapper
    isSelected={isSelected}
    position={position}
    onClick={stopClickPropagation}
  >
    {dndEnabled && (
      <DndHandle className={dragHandleClassName}>
        <Icon icon="dotsSixVertical" size="normal" />
      </DndHandle>
    )}
    <BlockOptions
      isSelected={isSelected}
      onClick={!isSelected ? onClick : undefined}
    >
      {actionItems.map(
        (a, idx) =>
          !a.hide && (
            <Fragment key={idx}>
              {a.icon === "settingFilled" ? (
                <>
                  <OptionsWrapper onClick={onPopupMenuClick}>
                    <PopupMenu
                      label={
                        <OptionWrapper showPointer={!isSelected || !!a.onClick}>
                          <OptionIconWrapper border={idx !== 0}>
                            <OptionIcon icon={a.icon} size="normal" />
                          </OptionIconWrapper>
                          {a.name && <TitleWrapper>{a.name}</TitleWrapper>}
                        </OptionWrapper>
                      }
                      placement="bottom-end"
                      menu={popupMenuItem}
                      width={150}
                      openMenu={openMenu}
                      onOpenChange={setOpenMenu}
                    />
                  </OptionsWrapper>
                  {showPadding && !openMenu && (
                    <Popup
                      open={showSettings && isSelected}
                      onOpenChange={onSettingsToggle}
                      placement="bottom-end"
                      offset={16}
                    >
                      <PopupContent>
                        <PopupPanel
                          title={settingsTitle}
                          onCancel={() => {
                            setShowPadding(false);
                            setOpenMenu(true);
                            onSettingsToggle?.();
                          }}
                          width={200}
                        >
                          {propertyId && contentSettings && (
                            <SettingsContent>
                              <FieldsWrapper>
                                {Object.keys(contentSettings).map(
                                  (fieldId, index) => {
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
                                        onPropertyItemDelete={
                                          onPropertyItemDelete
                                        }
                                      />
                                    );
                                  }
                                )}
                              </FieldsWrapper>
                            </SettingsContent>
                          )}
                        </PopupPanel>
                      </PopupContent>
                    </Popup>
                  )}
                </>
              ) : (
                <OptionWrapper
                  showPointer={!isSelected || !!a.onClick}
                  onClick={a.onClick}
                >
                  <OptionIconWrapper border={idx !== 0}>
                    <OptionIcon icon={a.icon} size="normal" />
                  </OptionIconWrapper>
                  {a.name && <TitleWrapper>{a.name}</TitleWrapper>}
                </OptionWrapper>
              )}
            </Fragment>
          )
      )}
    </BlockOptions>
  </Wrapper>
);

export default ActionPanel;

const Wrapper = styled("div")<{
  isSelected?: boolean;
  position?: ActionPosition;
}>(({ isSelected, position, theme }) => ({
  background: !isSelected ? "#f1f1f1" : "none",
  color: theme.select.main,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing.smallest,
  height: "24px",
  position: "absolute",
  maxWidth: "100%",
  left:
    position === "left-top"
      ? "-1px"
      : position === "left-bottom"
        ? "0"
        : "auto",
  top: position === "left-top" || position === "right-top" ? "-25px" : "0",
  right:
    position === "right-bottom"
      ? "0"
      : position === "right-top"
        ? "-1px"
        : "auto"
}));

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.normal,
  userSelect: "none"
}));

const BlockOptions = styled("div")<{
  isSelected?: boolean;
}>(({ isSelected, theme }) => ({
  background: isSelected ? theme.select.main : "#f1f1f1",
  color: isSelected ? theme.content.main : theme.select.main,
  display: "flex",
  alignItems: "center",
  height: "24px"
}));

const OptionsWrapper = styled("div")(() => ({
  flexShrink: 0
}));

const PopupContent = styled("div")(({ theme }) => ({
  zIndex: theme.zIndexes.visualizer.storyBlock
}));

const OptionWrapper = styled("div")<{
  showPointer?: boolean;
}>(({ showPointer }) => ({
  display: "flex",
  alignItems: "center",
  cursor: showPointer ? "pointer" : "default"
}));

const TitleWrapper = styled("div")(({ theme }) => ({
  paddingRight: theme.spacing.smallest,
  fontSize: theme.fonts.sizes.footnote,
  fontWeight: theme.fonts.weight.regular,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: "150px"
}));

const OptionIcon = styled(Icon)(() => ({
  transition: "none"
}));

const OptionIconWrapper = styled("div")<{ border?: boolean }>(
  ({ border, theme }) => ({
    borderLeft: `1px solid ${border ? "#f1f1f1" : "transparent"}`,
    padding: theme.spacing.smallest
  })
);

const SettingsContent = styled("div")(() => ({
  minHeight: "120px",
  boxSizing: "border-box"
}));

const DndHandle = styled("div")(() => ({
  height: "100%",
  display: "flex",
  alignItems: "center",
  cursor: "move"
}));
