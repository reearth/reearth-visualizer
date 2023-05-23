import { Meta, Story } from "@storybook/react";

import AutoComplete, { Props } from ".";

export default {
  title: "atoms/AutoComplete",
  component: AutoComplete,
} as Meta;

const sampleItems: { value: string; label: string }[] = [
  {
    value: "hoge",
    label: "hoge",
  },
  {
    value: "fuga",
    label: "fuga",
  },
];

const addItem = (value: string) => {
  sampleItems.push({ value, label: value });
};

const handleSelect = (value: string) => {
  console.log("select ", value);
};

const handleCreate = (value: string) => {
  console.log("create ", value);
  addItem(value);
};

export const Default: Story<Props<string>> = () => {
  return <AutoComplete items={sampleItems} onCreate={handleCreate} onSelect={handleSelect} />;
};

export const Creatable: Story<Props<string>> = () => {
  return (
    <AutoComplete items={sampleItems} onCreate={handleCreate} onSelect={handleSelect} creatable />
  );
};
