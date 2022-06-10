import React, { useCallback } from "react";

import AutoComplete from "@reearth/components/atoms/AutoComplete";
import Box from "@reearth/components/atoms/Box";
import Flex from "@reearth/components/atoms/Flex";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

import { DEFAULT_TAG_ID } from "../common";
import TagGroup, { Tag } from "../TagGroup";

export type Props = {
  className?: string;
  allTagGroups?: TagGroup[];
  layerTagGroups?: TagGroup[];
  onTagGroupAdd?: (value: string) => void;
  onTagAdd?: (label: string, tagGroupId: string) => void;
  onTagGroupAttach?: (tagGroupId: string) => void;
  onTagAttach?: (tagId: string) => void;
  onTagGroupDetach?: (tagGroupId: string) => void;
  onTagItemDetach?: (tagItemId: string) => void;
};

export type TagGroup = {
  id: string;
  label: string;
  tags: Tag[];
};

const SceneTagPane: React.FC<Props> = ({
  className,
  allTagGroups,
  layerTagGroups,
  onTagGroupAdd,
  onTagAdd,
  onTagAttach,
  onTagGroupAttach,
  onTagGroupDetach,
  onTagItemDetach,
}) => {
  const t = useT();
  const handleTagGroupSelect = useCallback(
    (tagGroupLabel: string) => {
      const targetTagGroup = allTagGroups?.find(tg => tg.label === tagGroupLabel);
      if (!targetTagGroup) return;
      onTagGroupAttach?.(targetTagGroup?.id);
    },
    [allTagGroups, onTagGroupAttach],
  );
  return (
    <Wrapper className={className} direction="column">
      {layerTagGroups?.map(tg => (
        <Box key={tg.id} mb="l">
          <TagGroup
            title={tg.label}
            icon="cancel"
            allTags={allTagGroups?.find(atg => atg.id === tg.id)?.tags}
            attachedTags={tg.tags}
            onTagAdd={(t: string) => onTagAdd?.(t, tg.id)}
            onRemove={() => onTagGroupDetach?.(tg.id)}
            onSelect={(tagId: string) => onTagAttach?.(tagId)}
            onTagRemove={(tagId: string) => onTagItemDetach?.(tagId)}
            editable={false}
            removable={tg.id != DEFAULT_TAG_ID}
          />
        </Box>
      ))}
      <AutoComplete
        placeholder={t("Add a tag group")}
        onCreate={onTagGroupAdd}
        creatable
        items={allTagGroups
          ?.filter(tg => !layerTagGroups?.map(tg2 => tg2.id).includes(tg.id))
          .map(tg => ({ value: tg.label, label: tg.label }))}
        onSelect={handleTagGroupSelect}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  padding: ${({ theme }) => `${theme.metrics.l}px`};
`;

export default SceneTagPane;
