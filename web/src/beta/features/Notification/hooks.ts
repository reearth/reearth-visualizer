import { useState, useEffect, useCallback, useMemo } from "react";

import { useT, useLang } from "@reearth/services/i18n";
import { useError, useNotification, Notification } from "@reearth/services/state";

export type PolicyItems =
  | "layer"
  | "asset"
  | "dataset"
  | "createProject"
  | "publishProject"
  | "member";

const policyItems: PolicyItems[] = [
  "layer",
  "asset",
  "dataset",
  "createProject",
  "publishProject",
  "member",
];

export default () => {
  const t = useT();
  const currentLanguage = useLang();
  const [error, setError] = useError();
  const [notification, setNotification] = useNotification();
  const [visible, changeVisibility] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const policyLimitNotifications = window.REEARTH_CONFIG?.policy?.limitNotifications;

  const errorHeading = t("Error");
  const warningHeading = t("Warning");
  const noticeHeading = t("Notice");

  const notificationHeading = useMemo(
    () =>
      notification?.type === "error"
        ? errorHeading
        : notification?.type === "warning"
        ? warningHeading
        : noticeHeading,
    [notification?.type, errorHeading, warningHeading, noticeHeading],
  );

  const setModal = useCallback((show: boolean) => {
    changeVisibility(show);
  }, []);

  useEffect(() => {
    if (!error) return;
    if (error.message?.includes("policy violation") && error.message) {
      const limitedItem = policyItems.find(i => error.message?.includes(i));
      const policyItem =
        limitedItem && policyLimitNotifications ? policyLimitNotifications[limitedItem] : undefined;
      const message = policyItem
        ? typeof policyItem === "string"
          ? policyItem
          : policyItem[currentLanguage]
        : t(
            "You have reached a policy limit. Please contact an administrator of your Re:Earth system.",
          );

      setNotification({
        type: "info",
        heading: noticeHeading,
        text: message,
        duration: "persistent",
      });
    } else {
      setNotification({
        type: "error",
        heading: errorHeading,
        text: t("Something went wrong. Please try again later."),
      });
    }
    setError(undefined);
  }, [
    error,
    currentLanguage,
    policyLimitNotifications,
    errorHeading,
    noticeHeading,
    setError,
    setNotification,
    t,
  ]);

  useEffect(() => {
    if (!notification || notification?.duration === "persistent" || isHovered) return;
    let notificationTimeout = 2000;

    if (notification.duration) {
      notificationTimeout = notification.duration;
    }
    const timerID = setTimeout(() => {
      setModal(false);
    }, notificationTimeout);
    return () => clearTimeout(timerID);
  }, [notification, isHovered, setModal]);

  useEffect(() => {
    changeVisibility(!!notification);
  }, [notification]);

  return {
    isHovered,
    visible,
    notification: {
      type: notification?.type,
      heading: notificationHeading,
      text: notification?.text,
    } as Notification,
    setIsHovered,
    setModal,
  };
};
