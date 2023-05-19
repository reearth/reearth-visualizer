/* eslint-disable @typescript-eslint/no-unused-vars */
import { Meta, Story } from "@storybook/react";
import React, { useState } from "react";

import TagPane, { Props, TagGroup } from ".";

export default {
  title: "molecules/EarthEditor/TagPane",
  component: TagPane,
} as Meta;

export const Default: Story<Props> = () => {
  const [allTagGroups, setAllTagGroups] = useState<TagGroup[]>([
    {
      id: "default",
      label: "Default",
      tags: [
        { id: "hoge", label: "hoge" },
        { id: "fuga", label: "fuga" },
        { id: "foo", label: "foo" },
        { id: "wow", label: "wow" },
      ],
    },
    {
      id: "year",
      label: "Year",
      tags: [
        { id: "1995", label: "1995" },
        { id: "2000", label: "2000" },
        { id: "2005", label: "2005" },
      ],
    },
  ]);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([
    {
      id: "default",
      label: "Default",
      tags: [
        { id: "hoge", label: "hoge" },
        { id: "fuga", label: "fuga" },
      ],
    },
    {
      id: "year",
      label: "Year",
      tags: [
        { id: "1995", label: "1995" },
        { id: "2000", label: "2000" },
      ],
    },
  ]);
  // const isTagGroup = (tagGroup: any): tagGroup is TagGroup => {
  //   return "label" in tagGroup && "tags" in tagGroup && isArray(tagGroup["tags"]) && !!tagGroup;
  // };
  // const handleAddTagGroup = (value: string) => {
  //   setAllTagGroups(old =>
  //     old.find(g => g.label === value) ? old : [...old, { label: value, tags: [] }],
  //   );
  //   setTagGroups(old => [...old, { label: value, tags: [] }]);
  // };
  // const handleAddTag = (tagGroup: string, tag: string) => {
  //   setAllTagGroups(old => {
  //     const targetTagGroup = old.find(tg => tg.label === tagGroup);
  //     const result = targetTagGroup?.tags.includes(tag)
  //       ? old
  //       : isTagGroup(targetTagGroup)
  //       ? [
  //           ...old.filter(g => g !== targetTagGroup),
  //           { label: targetTagGroup?.label, tags: [...targetTagGroup?.tags, tag] },
  //         ]
  //       : [];
  //     return result;
  //   });

  //   setTagGroups(old => {
  //     return old.map(tg => {
  //       if (tg.label === tagGroup) {
  //         tg.tags.push(tag);
  //       }
  //       return tg;
  //     });
  //   });
  // };
  return (
    <TagPane
      allTagGroups={allTagGroups}
      // onTagGroupAdd={handleAddTagGroup}
      // onTagAdd={handleAddTag}
    />
  );
};
