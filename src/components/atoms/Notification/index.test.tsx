import { expect, test } from "vitest";

import { render, screen } from "@reearth/test/utils";

import NotificationBanner, { Notification } from ".";

const sampleNotification: Notification = {
  type: "info",
  heading: "Notice",
  text: "This is a notification for something super cool.",
};

test("should display notification heading", () => {
  render(<NotificationBanner visible notification={sampleNotification} />);
  expect(screen.getByText(/Notice/)).toBeInTheDocument();
  expect(screen.getByText(/This is a notification for something super cool./)).toBeInTheDocument();
});

test("should not display anything", () => {
  render(<NotificationBanner notification={sampleNotification} />);
  expect(screen.getByText(/This is a notification for something super cool./)).not.toBeVisible();
});
