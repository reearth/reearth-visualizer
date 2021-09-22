import React from "react";

import MoleculeNotificationBanner from "@reearth/components/atoms/Notification";

import useHooks from "./hooks";

const NotificationBanner: React.FC = () => {
  const { visible, setModal, notification, resetNotification } = useHooks();

  return (
    <MoleculeNotificationBanner
      visible={visible}
      setModal={setModal}
      notification={notification}
      resetNotification={resetNotification}
    />
  );
};

export default NotificationBanner;
