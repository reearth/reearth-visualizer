import React, { useCallback, useRef, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import { useClickAway } from "react-use";

import AutoComplete from "@reearth/components/atoms/AutoComplete";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Tag from "@reearth/components/atoms/Tag";
import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import { styled, useTheme } from "@reearth/theme";

export type Tag = {
  id: string;
  label: string;
};

export type Props = {
  className?: string;
  title?: string;
  icon?: "bin" | "cancel";
  removable?: boolean;
  editable?: boolean;
  tagDeletable?: boolean;
  onRemove?: () => void;
  onTitleEdit?: (value: string) => void;
  onTagAdd?: (value: string) => void;
  onTagRemove?: (id: string) => void;
  onSelect?: (tagId: string) => void;
  allTags?: Tag[];
  attachedTags?: Tag[];
};

const TagGroup: React.FC<Props> = ({
  className,
  title,
  icon,
  removable = true,
  editable = true,
  tagDeletable = false,
  onRemove,
  onTagAdd,
  onTagRemove,
  onSelect,
  allTags,
  attachedTags,
  onTitleEdit,
}) => {
  const theme = useTheme();
  const intl = useIntl();
  const [editing, setEditing] = useState(false);
  const titleRef = useRef(null);
  useClickAway(titleRef, () => setEditing(false));

  const handleEditTitle = useCallback(
    (value: string) => {
      onTitleEdit?.(value);
      setEditing(false);
    },
    [onTitleEdit],
  );

  const handleSelectTag = useCallback(
    (tagLabel: string) => {
      const targetTag = allTags?.find(t => t.label === tagLabel);
      if (!targetTag) return;
      onSelect?.(targetTag?.id);
    },
    [allTags, onSelect],
  );

  const autoCompleteItems = useMemo(() => {
    return allTags
      ?.filter(t => !attachedTags?.map(t2 => t2.id).includes(t.id))
      .map(t => ({ value: t.label, label: t.label }));
  }, [allTags, attachedTags]);

  const isGroupRemovable = attachedTags?.length === 0;

  return (
    <Wrapper direction="column" align="center" justify="space-between" className={className}>
      <TitleWrapper ref={titleRef}>
        {editing ? (
          <TextBox value={title} onChange={handleEditTitle} />
        ) : (
          <Text size="s">{title}</Text>
        )}
        <Flex>
          {editable && (
            <IconWrapper align="center" onClick={() => setEditing(true)}>
              <Icon
                icon="edit"
                size={12}
                alt="tag-remove-icon"
                color={isGroupRemovable ? theme.text.default : theme.text.pale}
              />
            </IconWrapper>
          )}
          {removable && (
            <IconWrapper align="center" onClick={onRemove} testId="atoms-tag-event-trigger">
              <Icon
                icon={icon}
                color={theme.text.default}
                data-testid="atoms-tag-icon"
                alt="tag-icon"
                size={12}
              />
            </IconWrapper>
          )}
        </Flex>
      </TitleWrapper>
      <TagsWrapper wrap="wrap">
        {attachedTags?.map(t => (
          <Tag
            icon={tagDeletable ? "bin" : "cancel"}
            id={t.id}
            label={t.label}
            key={t.id}
            onRemove={onTagRemove}
          />
        ))}
      </TagsWrapper>
      <AutoComplete
        items={autoCompleteItems}
        onSelect={handleSelectTag}
        creatable
        onCreate={onTagAdd}
        placeholder={intl.formatMessage({ defaultMessage: "Add a tag" })}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  box-shadow: ${({ theme }) => `0px 4px 4px${theme.descriptionBalloon.shadowColor}`};
  padding: ${({ theme }) => `${theme.metrics.s}px`};
  min-width: 60px;
  width: auto;
  background: ${({ theme }) => theme.properties.bg};
`;

const TitleWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;
const IconWrapper = styled(Flex)`
  cursor: pointer;
  margin-right: ${({ theme }) => theme.metrics.s}px;
  margin-right: ${({ theme }) => theme.metrics.s}px;
`;

const TagsWrapper = styled(Flex)`
  margin: ${({ theme }) => `${theme.metrics.l}px 0px`};
  width: 100%;
`;

export default TagGroup;
