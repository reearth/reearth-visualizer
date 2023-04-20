import { Meta } from "@storybook/react";

import Notification from ".";

export default {
  title: "atoms/NotificationBanner",
  component: Notification,
} as Meta;

export const Success = () => (
  <Notification
    visible={true}
    notification={{
      type: "success",
      heading: "Notice",
      text: "This is a notice of successful completion of a task.",
    }}
  />
);
export const Error = () => (
  <Notification
    visible={true}
    notification={{
      type: "error",
      heading: "Error",
      text: "This is telling you that there is an error, hence the scary red color.",
    }}
  />
);
export const Warning = () => (
  <Notification
    visible={true}
    notification={{
      type: "warning",
      heading: "Warning",
      text: "This is a warning that something isn't quite right.",
    }}
  />
);
export const Info = () => (
  <Notification
    visible={true}
    notification={{
      type: "info",
      heading: "Notice",
      text: "This is a neutral message. Could be an update or some general information.",
    }}
  />
);
