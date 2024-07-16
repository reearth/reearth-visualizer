import { Meta } from "@storybook/react";

import PublicationStatus from ".";

export default {
  title: "beta/components/PublicationStatus",
  component: PublicationStatus,
} as Meta;

export const Published = () => <PublicationStatus status="published" />;
export const Limited = () => <PublicationStatus status="limited" />;
export const Unpublished = () => <PublicationStatus status="unpublished" />;
