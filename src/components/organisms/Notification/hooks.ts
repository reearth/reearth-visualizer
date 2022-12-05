import { useState, useEffect, useCallback, useMemo } from "react";

import { useT, useLang } from "@reearth/i18n";
import { useError, useNotification, Notification } from "@reearth/state";

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

  const resetNotification = useCallback(() => setNotification(undefined), [setNotification]);

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
    if (!notification) return;
    if (notification.duration === "persistent") return;

    let notificationTimeout = 5000;
    if (notification.duration) {
      notificationTimeout = notification.duration;
    }
    const timerID = setTimeout(() => {
      changeVisibility(false);
    }, notificationTimeout);
    return () => clearTimeout(timerID);
  }, [notification]);

  useEffect(() => {
    changeVisibility(!!notification);
  }, [notification]);

  return {
    visible,
    notification: {
      type: notification?.type,
      heading: notificationHeading,
      text: notification?.text,
    } as Notification,
    setModal,
    resetNotification,
  };
};
