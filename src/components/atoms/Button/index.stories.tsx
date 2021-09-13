import { Meta } from "@storybook/react";
import React from "react";

import Button from ".";

export default {
  title: "atoms/Buttons/Button",
  component: Button,
} as Meta;

export const PrimarySmall = () => <Button buttonType="primary" text="Primary" />;
export const PrimaryLarge = () => <Button buttonType="primary" text="Primary" large />;
export const SecondarySmall = () => <Button buttonType="secondary" text="secondary" />;
export const SecondaryLarge = () => <Button buttonType="secondary" text="secondary" large />;
export const DangerSmall = () => <Button buttonType="danger" text="danger" />;
export const DangerLarge = () => <Button buttonType="danger" text="danger" large />;
export const Disabled = () => (
  <Button buttonType="primary" text="disabled" icon="datasetAdd" disabled />
);

export const WithIcon = () => <Button buttonType="primary" text="Primary" icon="datasetAdd" />;
export const WithIconRight = () => (
  <Button buttonType="secondary" text="secondary" icon="datasetAdd" iconRight />
);
