import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

import { styled } from "@reearth/theme";

import CheckGroup from ".";

const items: { value: string; label: string }[] = [
  { value: "0", label: "A" },
  { value: "1", label: "B" },
  { value: "2", label: "C" },
];

const Check = styled.div<{ value: string; label: string }>``;

export default {
  title: "atoms/CheckGroup",
  component: CheckGroup,
} as Meta;

export const Default = () => (
  <CheckGroup values={["0"]} onChange={action("onchange")}>
    {items.map(({ value, label }) => (
      <Check key={value} value={value} label={label}>
        {label}
      </Check>
    ))}
  </CheckGroup>
);
