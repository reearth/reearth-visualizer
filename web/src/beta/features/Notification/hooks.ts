import { useT, useLang } from "@reearth/services/i18n";
import { useNotification, Notification } from "@reearth/services/state";
import { useErrors } from "@reearth/services/state/gqlErrorHandling";
import { useState, useEffect, useCallback, useMemo } from "react";

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
  "member"
];

export default () => {
  const t = useT();
  const currentLanguage = useLang();
  const [errors, setErrors] = useErrors();
  const [notification, setNotification] = useNotification();
  const [visible, changeVisibility] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const policyLimitNotifications =
    window.REEARTH_CONFIG?.policy?.limitNotifications;

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
    [notification?.type, errorHeading, warningHeading, noticeHeading]
  );

  const setModal = useCallback((show: boolean) => {
    changeVisibility(show);
  }, []);

  useEffect(() => {
    if (errors.length === 0) return;
    const defaultErrorMessage = t(
      "You have reached a policy limit. Please contact an administrator of your Re:Earth system."
    );
    errors.forEach((error) => {
      const isPolicyViolation = error.message
        ?.toLowerCase()
        .includes("policy violation");
      if (isPolicyViolation && error.message) {
        const limitedItem = policyItems.find((i) => error.message?.includes(i));
        const policyItem =
          limitedItem && policyLimitNotifications
            ? policyLimitNotifications[limitedItem]
            : undefined;
        const message = policyItem
          ? typeof policyItem === "string"
            ? policyItem
            : policyItem[currentLanguage]
          : defaultErrorMessage;

        setNotification({
          type: "info",
          heading: noticeHeading,
          text: message,
          duration: "persistent"
        });
      } else {
        setNotification({
          type: "error",
          heading: errorHeading,
          text: error.description || error.message || ""
        });
      }
    });
    setErrors([]);
  }, [
    errors,
    currentLanguage,
    policyLimitNotifications,
    errorHeading,
    noticeHeading,
    setErrors,
    setNotification,
    t
  ]);

  useEffect(() => {
    if (!notification || notification?.duration === "persistent" || isHovered)
      return;
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
      text: notification?.text
    } as Notification,
    setIsHovered,
    setModal
  };
};
