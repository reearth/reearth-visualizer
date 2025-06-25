import { getIconName } from "@reearth/app/features/Visualizer/Crust/StoryPanel/utils";
import { IconName, PopupMenuItem } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useCallback,
  useMemo,
  useState
} from "react";

import type { ActionItem } from "../../ActionPanel";

type Props = {
  title?: string;
  icon?: string | IconName;
  isSelected?: boolean;
  editMode?: boolean;
  contentSettings?: any;
  isPluginBlock?: boolean;
  setShowPadding: Dispatch<SetStateAction<boolean>>;
  onRemove?: () => void;
  onEditModeToggle?: (enable: boolean) => void;
  onSettingsToggle?: (e?: MouseEvent<HTMLDivElement>) => void;
};

export default ({
  title,
  icon,
  isSelected,
  editMode,
  contentSettings,
  isPluginBlock,
  setShowPadding,
  onRemove,
  onEditModeToggle,
  onSettingsToggle
}: Props) => {
  const t = useT();
  const handleRemove = useCallback(() => {
    onRemove?.();
    onSettingsToggle?.();
  }, [onRemove, onSettingsToggle]);

  const settingsTitle = useMemo(() => t("Spacing settings"), [t]);
  const [openMenu, setOpenMenu] = useState(false);

  const popupMenuItem: PopupMenuItem[] = useMemo(() => {
    const menuItems: PopupMenuItem[] = [];
    if (!isPluginBlock && contentSettings) {
      menuItems.push({
        id: "padding",
        title: settingsTitle,
        icon: "padding",
        onClick: () => {
          setShowPadding(true);
          onSettingsToggle?.();
        }
      });
    }
    if (onRemove) {
      menuItems.push({
        id: "delete",
        title: t("Delete"),
        icon: "trash",
        onClick: handleRemove
      });
    }
    return menuItems;
  }, [
    isPluginBlock,
    contentSettings,
    onRemove,
    settingsTitle,
    setShowPadding,
    onSettingsToggle,
    t,
    handleRemove
  ]);

  const actionItems: ActionItem[] = useMemo(() => {
    const iconName = getIconName(icon);
    const menuItems: ActionItem[] = [
      {
        name: title ?? t("Block"),
        icon: iconName
      }
    ];

    if (
      onEditModeToggle &&
      !!contentSettings &&
      Object.keys(contentSettings).length !== 0
    ) {
      menuItems.push({
        icon: editMode ? "exit" : "editMode",
        hide: !isSelected,
        onClick: () => onEditModeToggle?.(!editMode)
      });
    }

    if (onSettingsToggle) {
      menuItems.push({
        icon: "settingFilled",
        hide: !isSelected,
        onClick: onSettingsToggle
      });
    }

    return menuItems;
  }, [
    title,
    icon,
    isSelected,
    editMode,
    contentSettings,
    t,
    onEditModeToggle,
    onSettingsToggle
  ]);

  const handlePopupMenuClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  return {
    settingsTitle,
    popupMenuItem,
    actionItems,
    openMenu,
    handlePopupMenuClick,
    setOpenMenu
  };
};
