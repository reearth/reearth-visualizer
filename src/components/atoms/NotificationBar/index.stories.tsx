import { Meta } from "@storybook/react";
import React from "react";

import NotificationBar from ".";

export default {
  title: "atoms/NotificationBar",
  component: NotificationBar,
} as Meta;

export const Info = () => <NotificationBar text="Successfully done" />;
export const Error = () => <NotificationBar type={"error"} text="Error!" />;
export const Warning = () => <NotificationBar type={"warning"} text="This API is deprecated!!" />;
