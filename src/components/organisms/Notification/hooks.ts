import { useState, useEffect, useCallback } from "react";

import { useT } from "@reearth/i18n";
import { useError, useNotification, Notification } from "@reearth/state";

export const notificationTimeout = 5000;

export default () => {
  const t = useT();
  const [error, setError] = useError();
  const [notification, setNotification] = useNotification();
  const [visible, changeVisibility] = useState(false);

  const errorMessage = t("Error");
  const warningMessage = t("Warning");
  const noticeMessage = t("Notice");

  const notificationHeading =
    notification?.type === "error"
      ? errorMessage
      : notification?.type === "warning"
      ? warningMessage
      : noticeMessage;

  const resetNotification = useCallback(() => setNotification(undefined), [setNotification]);

  const setModal = (show: boolean) => {
    changeVisibility(show);
  };

  useEffect(() => {
    if (!error) return;
    setNotification({
      type: "error",
      heading: errorMessage,
      text: t("Something went wrong. Please try again later."),
    });
    setError(undefined);
  }, [error, setError, errorMessage, setNotification, t]);

  useEffect(() => {
    if (!notification) return;
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
    setModal,
    notification: {
      type: notification?.type,
      heading: notificationHeading,
      text: notification?.text,
    } as Notification,
    resetNotification,
  };
};
