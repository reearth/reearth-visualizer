import React from "react";

import MoleculeNotificationBanner from "@reearth/components/atoms/Notification";

import useHooks from "./hooks";

const NotificationBanner: React.FC = () => {
  const { visible, notification, setModal, resetNotification } = useHooks();

  return (
    <MoleculeNotificationBanner
      visible={visible}
      notification={notification}
      setModal={setModal}
      resetNotification={resetNotification}
    />
  );
};

export default NotificationBanner;
