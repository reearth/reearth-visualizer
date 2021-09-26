import React from "react";

import { render, screen } from "@reearth/test/utils";

import NotificationBanner, { Notification } from ".";

const sampleNotification: Notification = {
  type: "info",
  heading: "Notice",
  text: "This is a notification for something super cool.",
};

test.skip("Notification component should be rendered", () => {
  render(<NotificationBanner />);
});

test.skip("Notification component should display notification heading", () => {
  render(<NotificationBanner visible notification={sampleNotification} />);
  expect(screen.getByText(/Notice/)).toBeInTheDocument();
});

test.skip("Notification component should display notification text", () => {
  render(<NotificationBanner visible notification={sampleNotification} />);
  expect(screen.getByText(/This is a notification/)).toBeInTheDocument();
});

test.skip("Notification component should not display anything", () => {
  render(<NotificationBanner notification={sampleNotification} />);
  expect(screen.getByText(/This is a notification/)).not.toBeVisible();
});
