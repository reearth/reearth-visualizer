import { useState, useEffect, useCallback } from "react";
import { useIntl } from "react-intl";

import { useError, useNotification, Notification } from "@reearth/state";

export const notificationTimeout = 5000;

export default () => {
  const intl = useIntl();
  const [error, setError] = useError();
  const [notification, setNotification] = useNotification();
  const [visible, changeVisibility] = useState(false);

  const errorMessage = intl.formatMessage({ defaultMessage: "Error" });
  const warningMessage = intl.formatMessage({ defaultMessage: "Warning" });
  const noticeMessage = intl.formatMessage({ defaultMessage: "Notice" });

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
      text: intl.formatMessage({ defaultMessage: "Something went wrong. Please try again later." }),
    });
    setError(undefined);
  }, [error, setError, errorMessage, setNotification, intl]);

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
