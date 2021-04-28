import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import { styled, useTheme } from "@reearth/theme";
import Icon from "@reearth/components/atoms/Icon";
import AssetIcon from "@reearth/components/molecules/Settings/Workspace/Asset/AssetIcon";
import Text from "@reearth/components/atoms/Text";

export type Props = {
  className?: string;
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
  createdAt?: Date;
  onRemove?: (id: string) => void;
};

const AssetItem: React.FC<Props> = ({
  className,
  id,
  name,
  url,
  contentType,
  createdAt,
  onRemove,
}) => {
  const [isHover, setIsHover] = useState(false);
  const handleRemove = useCallback(() => onRemove?.(id), [id, onRemove]);
  const theme = useTheme();

  return (
    <Wrapper
      className={className}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}>
      <Preview>
        {url ? <Image url={url} /> : <Iconz type={contentType} />}
        {isHover && (
          <Actions>
            <TrashIcon icon="bin" size={20} onClick={handleRemove} />
          </Actions>
        )}
      </Preview>
      <Meta>
        <Text size="m" otherProperties={{ textOverflow: "ellipsis", overflow: "hidden" }}>
          {name}
        </Text>
        <CreatedAt size="s" color={theme.colors.text.weak} otherProperties={{ textAlign: "right" }}>
          {createdAt && format(createdAt, "yyyy-MM-dd HH:mm")}
        </CreatedAt>
      </Meta>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 250px;
  height: 250px;
  background: #232226;
`;

const Iconz = styled(AssetIcon)`
  width: 30px;
  height: 30px;
`;

const Preview = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 20px 8px 20px;
  box-sizing: border-box;
  background: #232226;
`;

const Actions = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(34, 34, 34, 0.9);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 10px;
  box-sizing: border-box;
`;

const TrashIcon = styled(Icon)`
  color: #ff3c53;
  cursor: pointer;
  padding: 10px;
`;

const Image = styled.div<{ url: string }>`
  height: 175px;
  width: 100%;
  max-width: 234px;
  background: ${({ url }) => `url(${url})`};
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  margin-left: 22px;
`;

const CreatedAt = styled(Text)`
  margin-top: 6px;
`;

export default AssetItem;
