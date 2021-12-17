/* eslint-disable @typescript-eslint/no-unused-vars */
import { Meta, Story } from "@storybook/react";
import React, { useState } from "react";

import TagGroup, { Props } from ".";

export default {
  title: "molecules/EarthEditor/TagGroup/TagGroup",
  component: TagGroup,
} as Meta;

export const Default: Story<Props> = () => {
  const [attachedTags, setAttachedTags] = useState([
    { id: "hoge", label: "hoge" },
    { id: "fuga", label: "fuga" },
  ]);
  const [allTags, setAllTags] = useState([
    { id: "hoge", label: "hoge" },
    { id: "fuga", label: "fuga" },
    { id: "foo", label: "foo" },
  ]);
  // const handleSelect = (value: string) => {
  //   setAttachedTags(old => [...old, value]);
  // };
  // const handleDetach = (value: string) => {
  //   setAttachedTags(old => old.filter(t => t != value));
  // };
  // const handleCreate = (value: string) => {
  //   setAttachedTags(old => [...old, value]);
  //   setAllTags(old => [...old, value]);
  // };
  return (
    <TagGroup
      attachedTags={attachedTags}
      allTags={allTags}
      // onSelect={handleSelect}
      // onTagAdd={handleCreate}
      // onTagRemove={handleDetach}
      title="Default"
      icon="cancel"
    />
  );
};
