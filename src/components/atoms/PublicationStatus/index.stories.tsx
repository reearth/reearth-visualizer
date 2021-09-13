import { Meta } from "@storybook/react";
import React from "react";

import PublicationStatus from ".";

export default {
  title: "atoms/PublicationStatus",
  component: PublicationStatus,
} as Meta;

export const Published = () => <PublicationStatus status="published" />;
export const Limited = () => <PublicationStatus status="limited" />;
export const Unpublished = () => <PublicationStatus status="unpublished" />;
