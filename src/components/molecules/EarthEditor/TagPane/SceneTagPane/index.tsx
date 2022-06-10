import React from "react";

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
  onTagGroupAdd?: (value: string) => void;
  onTagAdd?: (label: string, tagGroupId: string) => void;
  onTagGroupRemove?: (tagGroupId: string) => void;
  onTagItemRemove?: (tagItemId: string) => void;
  onTagGroupUpdate?: (tagGroupId: string, label: string) => void;
};

export type TagGroup = {
  id: string;
  label: string;
  tags: Tag[];
};

const SceneTagPane: React.FC<Props> = ({
  className,
  onTagGroupAdd,
  onTagAdd,
  allTagGroups,
  onTagGroupRemove,
  onTagItemRemove,
  onTagGroupUpdate,
}) => {
  const t = useT();
  return (
    <Wrapper className={className} direction="column">
      {allTagGroups?.map(tg => (
        <Box key={tg.id} mb="l">
          <TagGroup
            title={tg.label}
            icon="bin"
            allTags={tg.tags}
            attachedTags={tg.tags}
            onTagAdd={(t: string) => onTagAdd?.(t, tg.id)}
            onRemove={() => onTagGroupRemove?.(tg.id)}
            onTagRemove={onTagItemRemove}
            onTitleEdit={(label: string) => onTagGroupUpdate?.(tg.id, label)}
            editable={tg.id !== DEFAULT_TAG_ID}
            removable={tg.id != DEFAULT_TAG_ID}
            tagDeletable
          />
        </Box>
      ))}
      <AutoComplete onCreate={onTagGroupAdd} creatable placeholder={t("Add a tag group")} />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  padding: ${({ theme }) => `${theme.metrics.l}px`};
`;

export default SceneTagPane;
